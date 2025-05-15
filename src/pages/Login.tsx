
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';
import { authService } from '@/services/auth';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    // Only in production mode
    if (!isDevelopment) {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code && state) {
        setLoading(true);

        // In a real implementation, we would handle the OAuth callback here
        // For now, we'll just redirect to the home page
        // This is just a placeholder for the actual implementation
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }
  }, [searchParams]);

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // This will redirect to Microsoft login page
      await login('', '');
      // This code won't be reached as the page will redirect
    } catch (err) {
      setError('Authentication failed');
      setLoading(false);
    }
  };

  // Sample credentials for demo purposes (only shown in development mode)
  const sampleUsers = [
    { email: 'user@school.edu', password: 'password', description: 'Regular User' },
    { email: 'admin@school.edu', password: 'password', description: 'Admin User' },
    { email: 'superadmin@school.edu', password: 'password', description: 'Super Admin' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">
            <span className="acronym">R</span>apid
            <span className="acronym">E</span>mergency
            <span className="acronym">A</span>lert
            <span className="acronym">C</span>ommunication
            <span className="acronym">T</span>ool
          </h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access the emergency alert system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isDevelopment ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    Sign in with your Microsoft account to access REACT.
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              {isDevelopment ? (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleMicrosoftLogin}
                  disabled={loading}
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? 'Signing in...' : 'Sign in with Microsoft'}
                </Button>
              )}
            </form>
          </CardContent>
          {isDevelopment && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-gray-500 border-t w-full pt-4">
                <p className="mb-2">Sample accounts for demo:</p>
                <ul className="space-y-1">
                  {sampleUsers.map((user, index) => (
                    <li key={index} className="text-xs">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={() => {
                          setEmail(user.email);
                          setPassword(user.password);
                        }}
                      >
                        {user.email}
                      </Button>
                      <span className="text-gray-400"> - {user.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardFooter>
          )}
        </Card>

        <p className="text-center text-sm text-gray-500">
          {isDevelopment
            ? "Note: In production, this will be replaced with Microsoft OAuth authentication."
            : "This application uses Microsoft OAuth for secure authentication."}
        </p>
      </div>
    </div>
  );
};

export default Login;
