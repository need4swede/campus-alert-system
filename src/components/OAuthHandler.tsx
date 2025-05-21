import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { toast } from "@/components/ui/sonner";
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const OAuthHandler = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        console.log('OAuthHandler mounted, checking for OAuth callback parameters');
        console.log('Current location:', location.pathname, location.search);

        // Check if we have OAuth callback parameters in the URL
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code && state) {
            console.log('OAuth callback parameters detected in root path');
            console.log('OAuth callback parameters:', {
                code: code ? `${code.substring(0, 10)}...` : null,
                state
            });

            // Clear the URL parameters immediately to prevent re-processing on page refresh
            window.history.replaceState({}, document.title, '/');

            setLoading(true);

            // Process the OAuth callback
            const processCallback = async () => {
                console.log('Processing OAuth callback...');
                try {
                    // Handle the OAuth callback using our auth service
                    console.log('Calling authService.handleCallback...');
                    const user = await authService.handleCallback(code, state);
                    console.log('OAuth callback successful, user:', user);

                    // Show success message
                    setSuccess(true);
                    setLoading(false);

                    // Show toast notification
                    toast.success(`Welcome, ${user.name}! Your account has been created/updated.`);

                    // Clear the URL parameters and redirect to home
                    console.log('OAuth successful, redirecting to home page');
                    navigate('/', { replace: true });
                } catch (err) {
                    console.error('Authentication callback error:', err);
                    setError(err instanceof Error ? err.message : 'Authentication failed');
                    setLoading(false);
                }
            };

            processCallback();
        }
    }, [location, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-center text-gray-600">
                                    Completing authentication...
                                </p>
                                <p className="text-center text-gray-500 text-sm mt-2">
                                    Creating or updating your account...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center p-4">
                                <div className="text-red-500 flex flex-col items-center">
                                    <AlertCircle className="h-12 w-12 mb-4" />
                                    <p className="text-center font-medium">
                                        Authentication failed
                                    </p>
                                    <p className="text-center text-gray-600 mt-2">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center p-4">
                                <div className="text-green-500 flex flex-col items-center">
                                    <CheckCircle className="h-12 w-12 mb-4" />
                                    <p className="text-center font-medium">
                                        Authentication successful!
                                    </p>
                                    <p className="text-center text-gray-600 mt-2">
                                        Redirecting to dashboard...
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // If no OAuth callback parameters or processing is complete, render children
    return <>{children}</>;
};

export default OAuthHandler;
