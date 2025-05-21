import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected:', res.rows[0].now);
    }
});

// API Routes

// Get user by email
app.get('/api/users/email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log(`Looking up user with email: ${email}`);

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log(`User not found with email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`User found:`, result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting user by email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, msId, avatar } = req.body;
        console.log(`Creating new user:`, { name, email, msId });

        // Determine role based on email domain and patterns
        let role = 'user';
        if (email.includes('admin')) {
            role = email.includes('super') ? 'super-admin' : 'admin';
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log(`User already exists with email: ${email}, updating...`);

            // Update existing user
            const result = await pool.query(
                'UPDATE users SET name = $1, avatar_url = $2, microsoft_id = $3, updated_at = NOW() WHERE email = $4 RETURNING *',
                [name, avatar, msId, email]
            );

            return res.json(result.rows[0]);
        }

        // Create new user
        // First, get the default organization ID
        const orgResult = await pool.query('SELECT id FROM organizations LIMIT 1');
        if (orgResult.rows.length === 0) {
            console.error('No organization found');
            return res.status(500).json({ error: 'No organization found' });
        }
        const organizationId = orgResult.rows[0].id;

        // Create new user with the organization ID
        const result = await pool.query(
            'INSERT INTO users (name, email, role, organization_id, avatar_url, microsoft_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
            [name, email, role, organizationId, avatar, msId]
        );

        console.log(`User created:`, result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle OAuth token exchange
app.post('/auth/token', async (req, res) => {
    try {
        const { code, redirect_uri, code_verifier } = req.body;

        // Microsoft OAuth configuration
        const clientId = process.env.MS_CLIENT_ID;
        const clientSecret = process.env.MS_CLIENT_SECRET;
        const tenantId = process.env.MS_TENANT_ID;

        if (!clientId || !tenantId) {
            return res.status(500).json({ error: 'Missing OAuth configuration' });
        }

        // Exchange code for token
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirect_uri);
        params.append('code_verifier', code_verifier);

        if (clientSecret) {
            params.append('client_secret', clientSecret);
        }

        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error exchanging code for token:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to exchange code for token' });
    }
});

// Get user info from Microsoft Graph
app.get('/auth/userinfo', async (req, res) => {
    try {
        const { access_token } = req.query;

        if (!access_token) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error getting user info from Microsoft Graph:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Handle auth callback route
app.get('/auth/callback', (req, res) => {
    // Instead of trying to serve a static file, redirect to the frontend
    // with the same query parameters
    const queryParams = new URLSearchParams(req.query).toString();
    res.redirect(`/?${queryParams}`);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    // Only try to serve static files if the dist directory exists
    try {
        const distPath = path.join(__dirname, 'dist');
        if (fs.existsSync(distPath)) {
            app.use(express.static(distPath));

            app.get('*', (req, res) => {
                res.sendFile(path.join(distPath, 'index.html'));
            });
        } else {
            console.log('Warning: dist directory not found, static file serving disabled');
        }
    } catch (error) {
        console.error('Error setting up static file serving:', error);
    }
}

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
