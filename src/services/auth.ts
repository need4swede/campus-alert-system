import { User } from '@/types';
import { apiService } from './api';

// Mock user data (would come from API in development)
const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'user@school.edu',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?u=user'
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'admin@school.edu',
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?u=admin'
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'superadmin@school.edu',
        role: 'super-admin',
        avatar: 'https://i.pravatar.cc/150?u=superadmin'
    }
];

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Define the auth service interface
interface AuthService {
    login: (email: string, password?: string) => Promise<User | never>;
    logout: () => Promise<void>;
    getCurrentUser: () => User | null;
    saveUser: (user: User) => void;
    handleCallback?: (code: string, state: string) => Promise<User>;

    // Additional properties for MS OAuth
    clientId?: string;
    tenantId?: string;
    redirectUri?: string;
    authority?: () => string;
    endpoints?: {
        authorize: (clientId: string, redirectUri: string, state: string) => string;
        token: string;
        graphUserInfo: string;
    };
    exchangeCodeForToken?: (code: string) => Promise<{
        access_token: string;
        id_token: string;
        refresh_token: string;
    }>;
    getUserInfo?: (accessToken: string) => Promise<{
        id: string;
        displayName: string;
        mail: string;
        userPrincipalName: string;
    }>;
}

// Local authentication service
const localAuth: AuthService = {
    login: async (email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const foundUser = mockUsers.find(u => u.email === email);

                if (foundUser) {
                    resolve(foundUser);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    },

    logout: async (): Promise<void> => {
        // Just clear local storage in development mode
        localStorage.removeItem('user');
        return Promise.resolve();
    },

    getCurrentUser: (): User | null => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    },

    saveUser: (user: User): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Add a stub for handleCallback to satisfy the interface
    // This won't actually be used in development mode
    handleCallback: async (code: string, state: string): Promise<User> => {
        console.warn('handleCallback called in development mode');
        return Promise.reject(new Error('Not implemented in development mode'));
    }
};

// Microsoft OAuth authentication service
const msOAuth: AuthService = {
    // Microsoft OAuth client ID (would be set in environment variables)
    clientId: import.meta.env.VITE_MS_CLIENT_ID || '',

    // Microsoft OAuth tenant ID (would be set in environment variables)
    tenantId: import.meta.env.VITE_MS_TENANT_ID || '',

    // Microsoft OAuth redirect URI (would be set in environment variables)
    redirectUri: import.meta.env.VITE_MS_REDIRECT_URI || `${window.location.origin}/auth/callback`,

    // Microsoft OAuth authority
    authority: function () {
        return `https://login.microsoftonline.com/${this.tenantId}`;
    },

    // Microsoft OAuth endpoints
    endpoints: {
        authorize: function (clientId: string, redirectUri: string, state: string) {
            return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=openid%20profile%20email%20User.Read&state=${state}`;
        },
        token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        graphUserInfo: 'https://graph.microsoft.com/v1.0/me'
    },

    // Start the login process by redirecting to Microsoft OAuth
    login: async (): Promise<never> => {
        // Generate a random state to prevent CSRF
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('oauth_state', state);

        // Redirect to Microsoft OAuth login page
        window.location.href = msOAuth.endpoints.authorize(
            msOAuth.clientId,
            msOAuth.redirectUri,
            state
        );

        // This promise will never resolve as we're redirecting
        return new Promise<never>(() => { });
    },

    // Exchange authorization code for access token
    exchangeCodeForToken: async (code: string): Promise<{
        access_token: string;
        id_token: string;
        refresh_token: string;
    }> => {
        // In a real implementation, we would make an actual API call
        // For now, we'll simulate the token exchange
        console.log('Exchanging code for token...');

        // Simulate token exchange delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    access_token: `mock_access_token_${Date.now()}`,
                    id_token: `mock_id_token_${Date.now()}`,
                    refresh_token: `mock_refresh_token_${Date.now()}`
                });
            }, 500);
        });
    },

    // Get user info from Microsoft Graph API
    getUserInfo: async (accessToken: string): Promise<{
        id: string;
        displayName: string;
        mail: string;
        userPrincipalName: string;
    }> => {
        // In a real implementation, we would make an actual API call to Microsoft Graph
        // For now, we'll simulate the API response
        console.log('Getting user info from Microsoft Graph...');

        // Simulate API call delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate a random email domain to simulate different organizations
                const domains = ['school.edu', 'university.edu', 'college.edu'];
                const randomDomain = domains[Math.floor(Math.random() * domains.length)];

                // Generate a random name
                const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie'];
                const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown'];
                const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const randomName = `${randomFirstName} ${randomLastName}`;

                // Generate a random email
                const email = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@${randomDomain}`;

                resolve({
                    id: `ms-user-${Date.now()}`,
                    displayName: randomName,
                    mail: email,
                    userPrincipalName: email
                });
            }, 500);
        });
    },

    // Handle the OAuth callback
    handleCallback: async (code: string, state: string): Promise<User> => {
        // Verify state to prevent CSRF
        const savedState = localStorage.getItem('oauth_state');
        if (state !== savedState) {
            throw new Error('Invalid state parameter');
        }

        // Clear the saved state
        localStorage.removeItem('oauth_state');

        try {
            // Exchange the code for a token
            const tokens = await msOAuth.exchangeCodeForToken(code);

            // Get user info from Microsoft Graph API
            const msUserInfo = await msOAuth.getUserInfo(tokens.access_token);

            // Get or create user in our database
            const user = await apiService.getOrCreateUser({
                name: msUserInfo.displayName,
                email: msUserInfo.mail || msUserInfo.userPrincipalName,
                msId: msUserInfo.id,
                avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(msUserInfo.mail || msUserInfo.userPrincipalName)}`
            });

            // Save the user to local storage
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        } catch (error) {
            console.error('Error in OAuth callback:', error);
            throw error;
        }
    },

    // Logout the user
    logout: async (): Promise<void> => {
        // Clear local storage
        localStorage.removeItem('user');

        // In a real implementation, we would also redirect to the Microsoft logout endpoint
        // window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;

        return Promise.resolve();
    },

    // Get the current user from local storage
    getCurrentUser: (): User | null => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    },

    // Save the user to local storage
    saveUser: (user: User): void => {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

// Export the appropriate authentication service based on the environment
export const authService = isDevelopment ? localAuth : msOAuth;
