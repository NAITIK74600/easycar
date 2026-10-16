import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginOwner } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isOwner: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isOwner: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('easycars_owner_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('easycars_owner_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, pass: string) => {
    const res = await loginOwner(email, pass);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('easycars_owner_token', res.token);
    localStorage.setItem('easycars_owner_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('easycars_owner_token');
    localStorage.removeItem('easycars_owner_user');
  };

  const isOwner = Boolean(user && (user.role === 'owner' || user.role === 'admin'));

  return (
    <AuthContext.Provider value={{ user, token, isOwner, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
