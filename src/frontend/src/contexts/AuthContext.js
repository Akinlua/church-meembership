import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        username,
        password
      });
      
      const { token, user, passwordChangeRequired } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setPasswordChangeRequired(passwordChangeRequired || false);
      
      return { 
        success: true, 
        passwordChangeRequired: passwordChangeRequired || false 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setPasswordChangeRequired(false);
  };

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/verify`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.valid) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setPasswordChangeRequired(response.data.passwordChangeRequired || false);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const changePassword = async (newPassword) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/change-password`,
        { newPassword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.status === 200) {
        setPasswordChangeRequired(false);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false };
    }
  };

  // Add signup function
  const signup = async (name,  username, password, confirmPassword) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, {
        name,
        username,
        password,
        confirmPassword
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Check if user has access to a specific feature
  const hasAccess = (accessType) => {
    if (!currentUser) return false;
    
    // Super admin can access everything
    if (currentUser.role === 'admin') return true;
    
    // Otherwise check direct user permissions
    switch(accessType) {
      case 'member':
        return currentUser.memberAccess;
      case 'visitor':
        return currentUser.visitorAccess;
      case 'vendor':
        return currentUser.vendorAccess;
      case 'group':
        return currentUser.groupAccess;
      case 'donation':
        return currentUser.donationAccess;
      case 'admin':
        return currentUser.adminAccess;
      case 'expense':
        return currentUser.expenseAccess;
      case 'charges':
        return currentUser.chargesAccess;
      case 'checks':
        return currentUser.checksAccess;
      case 'reports':
        return currentUser.reportsAccess;
      case 'deposit':
        return currentUser.depositAccess;
      case 'bank':
        return currentUser.bankAccess;
      default:
        return false;
    }
  };

  // Check if user has delete access for a specific feature
  const hasDeleteAccess = (accessType) => {
    if (!currentUser) return false;
    
    // Super admin can delete everything
    if (currentUser.role === 'admin') return true;
    
    // Otherwise check direct user permissions
    switch(accessType) {
      case 'member':
        return currentUser.memberAccess && !currentUser.cannotDeleteMember;
      case 'visitor':
        return currentUser.visitorAccess && !currentUser.cannotDeleteVisitor;
      case 'vendor':
        return currentUser.vendorAccess && !currentUser.cannotDeleteVendor;
      case 'group':
        return currentUser.groupAccess && !currentUser.cannotDeleteGroup;
      case 'donation':
        return currentUser.donationAccess && !currentUser.cannotDeleteDonation;
      case 'expense':
        return currentUser.expenseAccess && !currentUser.cannotDeleteExpense;
      case 'charges':
        return currentUser.chargesAccess && !currentUser.cannotDeleteCharges;
      case 'checks':
        return currentUser.checksAccess && !currentUser.cannotDeleteChecks;
      case 'reports':
        return currentUser.reportsAccess && !currentUser.cannotDeleteReports;
      case 'deposit':
        return currentUser.depositAccess && !currentUser.cannotDeleteDeposit;
      case 'bank':
        return currentUser.bankAccess && !currentUser.cannotDeleteBank;
      default:
        return false;
    }
  };

  // Add this function to the AuthContext
  const hasAddAccess = (accessType) => {
    if (!currentUser) return false;
    
    // Super admin can add everything
    if (currentUser.role === 'admin') return true;
    
    // Otherwise check direct user permissions
    switch(accessType) {
      case 'member':
        return currentUser.memberAccess && currentUser.canAddMember;
      case 'visitor':
        return currentUser.visitorAccess && currentUser.canAddVisitor;
      case 'vendor':
        return currentUser.vendorAccess && currentUser.canAddVendor;
      case 'group':
        return currentUser.groupAccess && currentUser.canAddGroup;
      case 'donation':
        return currentUser.donationAccess && currentUser.canAddDonation;
      case 'expense':
        return currentUser.expenseAccess && currentUser.canAddExpense;
      case 'charges':
        return currentUser.chargesAccess && currentUser.canAddCharges;
      case 'checks':
        return currentUser.checksAccess && currentUser.canAddChecks;
      case 'reports':
        return currentUser.reportsAccess && currentUser.canAddReports;
      case 'deposit':
        return currentUser.depositAccess && currentUser.canAddDeposit;
      case 'bank':
        return currentUser.bankAccess && currentUser.canAddBank;
      default:
        return false;
    }
  };

  // Add this function to check if user should only see their own data
  const shouldSeeOnlyOwnData = (accessType) => {
    if (!currentUser) return false;
    
    // Admin can see all data
    if (currentUser.role === 'admin') return false;
    
    // Check if this user is restricted to only seeing their own data
    switch(accessType) {
      case 'member':
        return currentUser.memberOnlyOwnData || false;
      case 'visitor':
        return currentUser.visitorOnlyOwnData || false;
      default:
        return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    passwordChangeRequired,
    login,
    logout,
    changePassword,
    signup,
    hasAccess,
    hasDeleteAccess,
    hasAddAccess,
    shouldSeeOnlyOwnData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 