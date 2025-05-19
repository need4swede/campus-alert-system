import { User } from '@/types';

// Base API URL - would be set in environment variables in a real app
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Mock database for development
const mockUserDatabase: User[] = [];

/**
 * API service for interacting with the backend
 */
export const apiService = {
    /**
     * Create a new user in the database
     * @param userData User data from Microsoft Graph API
     * @returns The created user
     */
    createUser: async (userData: {
        name: string;
        email: string;
        msId?: string;
        avatar?: string;
    }): Promise<User> => {
        if (isDevelopment) {
            // In development, simulate creating a user in the database
            console.log('Creating user in mock database:', userData);

            // Check if user already exists in our mock database
            const existingUser = mockUserDatabase.find(u => u.email === userData.email);
            if (existingUser) {
                return existingUser;
            }

            // Create a new user with a role based on email
            const role = userData.email.includes('admin')
                ? userData.email.includes('super') ? 'super-admin' : 'admin'
                : 'user';

            const newUser: User = {
                id: `user-${Date.now()}`,
                name: userData.name,
                email: userData.email,
                role,
                avatar: userData.avatar
            };

            // Add to mock database
            mockUserDatabase.push(newUser);
            return newUser;
        } else {
            // In production, make an actual API call
            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
        }
    },

    /**
     * Check if a user exists in the database
     * @param email User's email
     * @returns The user if found, null otherwise
     */
    getUserByEmail: async (email: string): Promise<User | null> => {
        if (isDevelopment) {
            // In development, check the mock database
            console.log('Checking for user in mock database:', email);
            const user = mockUserDatabase.find(u => u.email === email);
            return user || null;
        } else {
            // In production, make an actual API call
            try {
                const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.status === 404) {
                    return null;
                }

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error getting user by email:', error);
                throw error;
            }
        }
    },

    /**
     * Get a user by ID
     * @param id User ID
     * @returns The user if found
     */
    getUserById: async (id: string): Promise<User> => {
        if (isDevelopment) {
            // In development, check the mock database
            console.log('Getting user from mock database:', id);
            const user = mockUserDatabase.find(u => u.id === id);

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } else {
            // In production, make an actual API call
            try {
                const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error getting user by ID:', error);
                throw error;
            }
        }
    },

    /**
     * Get or create a user based on Microsoft OAuth data
     * @param msUserData User data from Microsoft Graph API
     * @returns The user from the database
     */
    getOrCreateUser: async (msUserData: {
        name: string;
        email: string;
        msId: string;
        avatar?: string;
    }): Promise<User> => {
        try {
            // First, try to get the user by email
            const existingUser = await apiService.getUserByEmail(msUserData.email);

            if (existingUser) {
                console.log('Found existing user:', existingUser);
                return existingUser;
            }

            // If user doesn't exist, create a new one
            console.log('Creating new user from Microsoft data:', msUserData);
            return await apiService.createUser(msUserData);
        } catch (error) {
            console.error('Error in getOrCreateUser:', error);
            throw error;
        }
    }
};
