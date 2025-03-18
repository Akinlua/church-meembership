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
    
    // Otherwise check user level permissions
    if (!currentUser.userLevel) return false;
    
    switch(accessType) {
      case 'member':
        return currentUser.userLevel.memberAccess;
      case 'visitor':
        return currentUser.userLevel.visitorAccess;
      case 'vendor':
        return currentUser.userLevel.vendorAccess;
      case 'group':
        return currentUser.userLevel.groupAccess;
      case 'donation':
        return currentUser.userLevel.donationAccess;
      case 'admin':
        return currentUser.userLevel.adminAccess;
      case 'expense':
        return currentUser.userLevel.expenseAccess;
      case 'charges':
        return currentUser.userLevel.chargesAccess;
      case 'reports':
        return currentUser.userLevel.reportsAccess;
      case 'deposit':
        return currentUser.userLevel.depositAccess;
      case 'bank':
        return currentUser.userLevel.bankAccess;
      default:
        return false;
    }
  };

  // Check if user has delete access for a specific feature
  const hasDeleteAccess = (accessType) => {
    if (!currentUser) return false;
    
    // Super admin can delete everything
    if (currentUser.role === 'admin') return true;
    
    // Otherwise check user level permissions
    if (!currentUser.userLevel) return false;
    
    switch(accessType) {
      case 'member':
        return currentUser.userLevel.memberAccess && !currentUser.userLevel.cannotDeleteMember;
      case 'visitor':
        return currentUser.userLevel.visitorAccess && !currentUser.userLevel.cannotDeleteVisitor;
      case 'vendor':
        return currentUser.userLevel.vendorAccess && !currentUser.userLevel.cannotDeleteVendor;
      case 'group':
        return currentUser.userLevel.groupAccess && !currentUser.userLevel.cannotDeleteGroup;
      case 'donation':
        return currentUser.userLevel.donationAccess && !currentUser.userLevel.cannotDeleteDonation;
      case 'expense':
        return currentUser.userLevel.expenseAccess && !currentUser.userLevel.cannotDeleteExpense;
      case 'charges':
        return currentUser.userLevel.chargesAccess && !currentUser.userLevel.cannotDeleteCharges;
      case 'reports':
        return currentUser.userLevel.reportsAccess && !currentUser.userLevel.cannotDeleteReports;
      case 'deposit':
        return currentUser.userLevel.depositAccess && !currentUser.userLevel.cannotDeleteDeposit;
      case 'bank':
        return currentUser.userLevel.bankAccess && !currentUser.userLevel.cannotDeleteBank;
      default:
        return false;
    }
  };

  // Add this function to the AuthContext
  const hasAddAccess = (accessType) => {
    if (!currentUser) return false;
    
    // Super admin can add everything
    if (currentUser.role === 'admin') return true;
    
    // Otherwise check user level permissions
    if (!currentUser.userLevel) return false;
    
    switch(accessType) {
      case 'member':
        return currentUser.userLevel.memberAccess && currentUser.userLevel.canAddMember;
      case 'visitor':
        return currentUser.userLevel.visitorAccess && currentUser.userLevel.canAddVisitor;
      case 'vendor':
        return currentUser.userLevel.vendorAccess && currentUser.userLevel.canAddVendor;
      case 'group':
        return currentUser.userLevel.groupAccess && currentUser.userLevel.canAddGroup;
      case 'donation':
        return currentUser.userLevel.donationAccess && currentUser.userLevel.canAddDonation;
      case 'expense':
        return currentUser.userLevel.expenseAccess && currentUser.userLevel.canAddExpense;
      case 'charges':
        return currentUser.userLevel.chargesAccess && currentUser.userLevel.canAddCharges;
      case 'reports':
        return currentUser.userLevel.reportsAccess && currentUser.userLevel.canAddReports;
      case 'deposit':
        return currentUser.userLevel.depositAccess && currentUser.userLevel.canAddDeposit;
      case 'bank':
        return currentUser.userLevel.bankAccess && currentUser.userLevel.canAddBank;
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
    hasAddAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 