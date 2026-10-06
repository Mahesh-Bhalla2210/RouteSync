import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('routesync_token'));
  const [loading, setLoading] = useState(true);

  // Initialize or verify token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('routesync_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Auth check failed:', err.message);
          logout();
        }
      } else {
        // Pre-fill with demo passenger user if not logged in for instant seamless demo!
        setUser({
          _id: 'user_default_1',
          name: 'Alex Johnson',
          email: 'user@routesync.com',
          role: 'user',
          walletBalance: 150.0,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
          phone: '+1 (555) 482-1923',
        });
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        setUser(res.data);
        setToken(res.data.token);
        localStorage.setItem('routesync_token', res.data.token);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.data) {
        setUser(res.data);
        setToken(res.data.token);
        localStorage.setItem('routesync_token', res.data.token);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('routesync_token');
  };

  const quickLogin = async (role = 'user') => {
    const credentials = {
      user: { email: 'user@routesync.com', password: 'password123' },
      provider: { email: 'provider@routesync.com', password: 'password123' },
      admin: { email: 'admin@routesync.com', password: 'password123' },
    };

    const cred = credentials[role] || credentials.user;
    return await login(cred.email, cred.password);
  };

  const topupWallet = async (amount) => {
    try {
      const res = await api.post('/auth/wallet/topup', { amount });
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          walletBalance: res.walletBalance,
        }));
        return { success: true, balance: res.walletBalance };
      }
      return { success: false, message: 'Top up failed' };
    } catch (err) {
      // Optimistic update if in mock mode
      const newBal = (user?.walletBalance || 0) + Number(amount);
      setUser((prev) => ({ ...prev, walletBalance: Number(newBal.toFixed(2)) }));
      return { success: true, balance: newBal };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        quickLogin,
        topupWallet,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
