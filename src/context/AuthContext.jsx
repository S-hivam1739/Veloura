import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('veloura_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('veloura_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('veloura_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('veloura_token', res.token);
      localStorage.setItem('veloura_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    return await api.register(userData);
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.verifyOtp({ email, otp });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('veloura_token', res.token);
      localStorage.setItem('veloura_user', JSON.stringify(res.user));
    }
    return res;
  };

  const resendOtp = async (email) => {
    return await api.resendOtp({ email });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('veloura_token');
    localStorage.removeItem('veloura_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
