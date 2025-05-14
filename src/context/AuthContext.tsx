
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from "@/components/ui/sonner";

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

// Mock user data (would come from API in production)
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Mock authentication - would be replaced with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email);
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('user', JSON.stringify(foundUser));
          toast.success(`Welcome, ${foundUser.name}`);
          resolve();
        } else {
          toast.error('Invalid email or password');
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
