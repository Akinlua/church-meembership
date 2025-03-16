import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, passwordChangeRequired } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (passwordChangeRequired) {
    return <Navigate to="/change-password" />;
  }
  
  return <Outlet />;
};

export const AdminRoute = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Allow access if user is super admin or has admin access through user level
  const isAdmin = currentUser.role === 'admin' || 
    (currentUser.userLevel && currentUser.userLevel.adminAccess);
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
};

export const PasswordChangeRoute = () => {
  const { isAuthenticated, passwordChangeRequired, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!passwordChangeRequired) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
}; 