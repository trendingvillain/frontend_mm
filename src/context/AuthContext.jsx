import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProfile } from '../config/api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // new

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetchProfile();
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          setIsAuthenticated(true);
          setIsApproved(userData.status === 'approved'); // check approval
        } else {
          
        }
      } catch (error) {

      }
    }
    setIsLoading(false);
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setIsApproved(userData.status === 'approved');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsApproved(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isApproved,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
