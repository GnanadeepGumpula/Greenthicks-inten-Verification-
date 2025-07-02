import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType } from '../types';
import { googleSheetsService } from '../services/googleSheets';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Get admin credentials from Google Sheets
      const adminCredentials = await googleSheetsService.getAdminCredentials();
      
      // Check if provided credentials match any admin account
      const validAdmin = adminCredentials.find(
        admin => admin.username === username && admin.password === password
      );
      
      if (validAdmin) {
        const token = 'admin_' + Date.now();
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_username', username);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};