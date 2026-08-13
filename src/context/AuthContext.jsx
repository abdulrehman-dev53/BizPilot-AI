import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getErrorMessage } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('bizpilot_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bizpilot_token'));
  const [initializing, setInitializing] = useState(true);

  const persist = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextToken) localStorage.setItem('bizpilot_token', nextToken);
    if (nextUser) localStorage.setItem('bizpilot_user', JSON.stringify(nextUser));
  };

  const clear = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bizpilot_token');
    localStorage.removeItem('bizpilot_user');
  };

  useEffect(() => {
    async function bootstrap() {
      const existingToken = localStorage.getItem('bizpilot_token');
      if (!existingToken) {
        setInitializing(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        persist(res.data.data.user, existingToken);
      } catch {
        clear();
      } finally {
        setInitializing(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: u, token: t } = res.data.data;
    persist(u, t);
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: u, token: t } = res.data.data;
    persist(u, t);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore — token is discarded client-side regardless */
    }
    clear();
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me');
    persist(res.data.data.user, localStorage.getItem('bizpilot_token'));
  }, []);

  const updateProfile = useCallback(async (payload) => {
    try {
      const res = await api.put('/auth/profile', payload);
      persist(res.data.data.user, localStorage.getItem('bizpilot_token'));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, initializing, login, register, logout, refreshUser, updateProfile, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
