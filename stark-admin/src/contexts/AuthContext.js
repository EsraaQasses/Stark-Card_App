import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid and user is admin
        const response = await axiosInstance.get('users/me/');
        const currentUser = response.data;
        
        // Ensure user is still admin and not banned
        if (currentUser.role === 'admin' && !currentUser.is_banned) {
          setUser(currentUser);
        } else {
          throw new Error('User no longer has admin access');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Legacy login (for backward compatibility)
  const login = async (name, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? 'users/login/admin/' : 'users/login/';
      const response = await axiosInstance.post(endpoint, {
        name,
        password
      });

      const { access, refresh, user: userData } = response.data;

      // Verify user is admin for admin dashboard
      if (isAdmin && userData.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.message ||
                          'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // 3-Step Admin Login
  const adminLoginStep1 = async (name, password) => {
    try {
      const response = await axiosInstance.post('users/login/admin/step1/', {
        name,
        password
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          'Step 1 failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const adminLoginStep2 = async (sessionToken, secondPassword) => {
    try {
      const response = await axiosInstance.post('users/login/admin/step2/', {
        session_token: sessionToken,
        second_password: secondPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          'Second password verification failed.';
      return { success: false, error: errorMessage };
    }
  };

  const adminLoginStep3 = async (sessionToken, otpCode) => {
    try {
      const response = await axiosInstance.post('users/login/admin/step3/', {
        session_token: sessionToken,
        otp_code: otpCode
      });

      const { access, refresh, user: userData } = response.data;

      // Verify user is admin
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message ||
                          'OTP verification failed.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // Call logout endpoint to blacklist tokens
    axiosInstance.post('users/logout/', {
      refresh: localStorage.getItem('refresh_token'),
      access: localStorage.getItem('access_token')
    }).catch(err => console.error('Logout API call failed:', err));
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Redirect to login
    window.location.href = '/login';
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('users/token/refresh/', {
        refresh
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    login,
    adminLoginStep1,
    adminLoginStep2,
    adminLoginStep3,
    logout,
    refreshToken,
    loading,
    isAuthenticated: !!user && user.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};