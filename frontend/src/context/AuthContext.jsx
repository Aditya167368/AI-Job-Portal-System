import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('user_openai_key') || '');
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // If token is invalid, clear it
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateOpenAiKey = (key) => {
    const cleanKey = key.trim();
    if (cleanKey) {
      localStorage.setItem('user_openai_key', cleanKey);
      setOpenAiKey(cleanKey);
    } else {
      localStorage.removeItem('user_openai_key');
      setOpenAiKey('');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        openAiKey,
        loading,
        login,
        signup,
        logout,
        refreshProfile,
        updateOpenAiKey,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
