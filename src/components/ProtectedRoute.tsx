
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking authentication', {
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    user,
    path: location.pathname,
    requireAdmin,
    requireSuperAdmin
  });

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    // Redirect to dashboard if super admin access is required but user is not a super admin
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to dashboard if admin access is required but user is not an admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
