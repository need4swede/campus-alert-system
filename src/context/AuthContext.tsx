
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from "@/components/ui/sonner";
import { authService } from '@/services/auth';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // In development mode, we use local auth with email/password
      // In production mode, we redirect to Microsoft OAuth
      if (isDevelopment) {
        const user = await authService.login(email, password);
        setUser(user);
        authService.saveUser(user);
        toast.success(`Welcome, ${user.name}`);
      } else {
        // For Microsoft OAuth, we don't need password
        // This will redirect to Microsoft login page
        await authService.login(email, '');
        // This code won't be reached as the page will redirect
      }
    } catch (error) {
      toast.error('Authentication failed');
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    toast.info('You have been logged out');
  };

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const isSuperAdmin = user?.role === 'super-admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        isAdmin,
        isSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
