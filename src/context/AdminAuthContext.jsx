import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // ✅ Restore admin state from localStorage on page load
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedRole === 'admin') {
      setAdminUser({ token: storedToken });
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = (token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('role', 'admin');
    setAdminUser({ token });
    setIsAdminAuthenticated(true);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('role');
    setAdminUser(null);
    setIsAdminAuthenticated(false);
  };

  const value = {
    adminUser,
    isAdminAuthenticated,
    adminLogin,
    adminLogout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
