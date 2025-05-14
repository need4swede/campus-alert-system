import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If we're in development mode, this page shouldn't be accessed
        if (isDevelopment) {
            window.location.href = '/login';
            return;
        }

        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            setError('Invalid callback parameters');
            setLoading(false);
            return;
        }

        // In a real implementation, we would handle the OAuth callback here
        // For now, we'll just redirect to the home page after a short delay
        // to simulate processing
        setTimeout(() => {
            // Store a mock user in local storage
            const mockUser = {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@school.edu',
                role: 'user',
                avatar: 'https://i.pravatar.cc/150?u=john'
            };

            localStorage.setItem('user', JSON.stringify(mockUser));

            // Redirect to home page
            window.location.href = '/';
        }, 2000);
    }, [searchParams]);

    if (isDevelopment) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center p-4">
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                    <p className="text-center text-gray-600">
                                        Completing authentication...
                                    </p>
                                </>
                            ) : error ? (
                                <div className="text-red-500 flex items-center">
                                    <AlertCircle className="h-6 w-6 mr-2" />
                                    <span>{error}</span>
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuthCallback;
