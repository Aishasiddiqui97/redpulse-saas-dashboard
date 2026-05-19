import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('saas_current_user');
        const token = localStorage.getItem('saas_auth_token');
        if (storedUser && token) {
          setCurrentUser(JSON.parse(storedUser));
          setAuthToken(token);
        }
      } catch (err) {
        console.error("Auth state initialization error", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        setCurrentUser(response.user);
        setAuthToken(response.token);
        localStorage.setItem('saas_current_user', JSON.stringify(response.user));
        localStorage.setItem('saas_auth_token', response.token);
        
        // Log activity
        await apiService.addActivityLog(
          'User login',
          `Logged in successfully as ${response.user.role}`,
          'auth'
        );
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await apiService.signup(name, email, password);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (currentUser) {
        await apiService.addActivityLog(
          'User logout',
          `User ${currentUser.name} signed out`,
          'auth'
        );
      }
      setCurrentUser(null);
      setAuthToken(null);
      localStorage.removeItem('saas_current_user');
      localStorage.removeItem('saas_auth_token');
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    return await apiService.forgotPassword(email);
  };

  const verifyOtp = async (email, otp) => {
    return await apiService.verifyOtp(email, otp);
  };

  const resetPassword = async (email, password) => {
    return await apiService.resetPassword(email, password);
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('saas_current_user', JSON.stringify(updatedUser));
      
      // Update in user list database too
      const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('saas_users', JSON.stringify(users));
      }

      await apiService.addActivityLog(
        'Profile Updated',
        `User details updated: ${Object.keys(updates).join(', ')}`,
        'settings'
      );
      
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    authToken,
    login,
    signup,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    updateProfile,
    isAdmin: currentUser?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
