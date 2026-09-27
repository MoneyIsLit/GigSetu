import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gigsetu_token'));
  const [loading, setLoading] = useState(true);
  const [workerProfile, setWorkerProfile] = useState(null);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('gigsetu_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.user.role === 'worker') {
      const profile = await api.get('/workers/me');
      setWorkerProfile(profile.data);
    }
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('gigsetu_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('gigsetu_token');
    setToken(null);
    setUser(null);
    setWorkerProfile(null);
  };

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      if (res.data.role === 'worker') {
        const profile = await api.get('/workers/me');
        setWorkerProfile(profile.data);
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, workerProfile, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
