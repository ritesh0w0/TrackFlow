import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '@/services/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    authApi
      .getCurrentUser()
      .then((userData) => {
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const userData = res.user || (await authApi.getCurrentUser());
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    const userData = res.user || (await authApi.getCurrentUser());
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
