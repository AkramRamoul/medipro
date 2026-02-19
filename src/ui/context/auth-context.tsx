import { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

export interface User {
  id: number;
  email: string;
  role: 'doctor' | 'receptionist' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthed: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthed: false,
  login: () => { },
  logout: () => { },
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth init failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthed: !!user,
      login,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
