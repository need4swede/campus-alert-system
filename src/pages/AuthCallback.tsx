import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '@/services/auth';
import { toast } from "@/components/ui/sonner";

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

        // Process the OAuth callback
        const processCallback = async () => {
            try {
                // Handle the OAuth callback using our auth service
                const user = await authService.handleCallback(code, state);

                // Show success message
                setSuccess(true);
                setLoading(false);

                // Show toast notification
                toast.success(`Welcome, ${user.name}! Your account has been created/updated.`);

                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } catch (err) {
                console.error('Authentication callback error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
                setLoading(false);
            }
        };

        processCallback();
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
                                    <p className="text-center text-gray-500 text-sm mt-2">
                                        Creating or updating your account...
                                    </p>
                                </>
                            ) : success ? (
                                <div className="text-green-500 flex flex-col items-center">
                                    <CheckCircle className="h-12 w-12 mb-4" />
                                    <p className="text-center font-medium">
                                        Authentication successful!
                                    </p>
                                    <p className="text-center text-gray-600 mt-2">
                                        Redirecting to dashboard...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 flex flex-col items-center">
                                    <AlertCircle className="h-12 w-12 mb-4" />
                                    <p className="text-center font-medium">
                                        Authentication failed
                                    </p>
                                    <p className="text-center text-gray-600 mt-2">
                                        {error}
                                    </p>
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
