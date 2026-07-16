import { createContext, useState, useEffect } from 'react';
import api, { authService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on mount if token is present
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
        } catch (err) {
          console.error('Session restore failed:', err.message);
          // Token is invalid or expired, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { token: userToken, ...userData } = response.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password, role);
      const { token: userToken, ...userData } = response.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    if (api.defaults?.headers?.common) {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
