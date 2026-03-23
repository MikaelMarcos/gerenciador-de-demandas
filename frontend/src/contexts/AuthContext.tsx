import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: number;
  full_name: string;
  username: string;
  role: string;
  is_approved: boolean;
  icon?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, keepConnected: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first (kept connected)
    const storedUser = localStorage.getItem('nuiam_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Fallback to sessionStorage
      const sessionUser = sessionStorage.getItem('nuiam_user');
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    }
    setLoading(false);
  }, []);

  const login = (newUser: User, keepConnected: boolean) => {
    setUser(newUser);
    if (keepConnected) {
      localStorage.setItem('nuiam_user', JSON.stringify(newUser));
      sessionStorage.removeItem('nuiam_user');
    } else {
      sessionStorage.setItem('nuiam_user', JSON.stringify(newUser));
      localStorage.removeItem('nuiam_user');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nuiam_user');
    sessionStorage.removeItem('nuiam_user');
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
