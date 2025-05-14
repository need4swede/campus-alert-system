
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Sample credentials for demo purposes
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

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
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
        </Card>
        
        <p className="text-center text-sm text-gray-500">
          Note: In production, this will be replaced with Microsoft OAuth authentication.
        </p>
      </div>
    </div>
  );
};

export default Login;
