import { User } from '@/types';

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

// Local authentication service
const localAuth = {
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
    }
};

// Microsoft OAuth authentication service
const msOAuth = {
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
            return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=openid%20profile%20email&state=${state}`;
        },
        token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
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

    // Handle the OAuth callback
    handleCallback: async (code: string, state: string): Promise<User> => {
        // Verify state to prevent CSRF
        const savedState = localStorage.getItem('oauth_state');
        if (state !== savedState) {
            throw new Error('Invalid state parameter');
        }

        // Clear the saved state
        localStorage.removeItem('oauth_state');

        // In a real implementation, we would exchange the code for a token
        // and then use the token to get the user's profile
        // For now, we'll just return a mock user

        // This would be replaced with an actual API call to exchange the code for a token
        // and then use the token to get the user's profile
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock user data - in a real implementation, this would come from the Microsoft Graph API
                const user: User = {
                    id: '1',
                    name: 'John Doe',
                    email: 'john.doe@school.edu',
                    role: 'user', // Role would be determined by your backend
                    avatar: 'https://i.pravatar.cc/150?u=john'
                };

                // Save the user to local storage
                localStorage.setItem('user', JSON.stringify(user));

                resolve(user);
            }, 1000);
        });
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
