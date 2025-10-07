import { createContext, useContext, useState, useEffect } from 'react';
import {
  isAuthenticated,
  getCurrentUser,
  logout as logoutService,
  getUser as getStoredUser,
  clearAuth,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      if (isAuthenticated()) {
        // Try to get user from localStorage first
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuth(true);
        }

        // Then fetch fresh user data
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuth(true);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // If token is invalid, clear auth
          if (error.response?.status === 401) {
            clearAuth();
            setUser(null);
            setIsAuth(false);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      setUser(null);
      setIsAuth(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    isAuth,
    loading,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};