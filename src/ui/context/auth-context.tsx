import { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

export type Role = 'doctor' | 'receptionist' | 'admin';

export type Permission =
  | 'VIEW_DASHBOARD_STATS'
  | 'MANAGE_USERS'
  | 'VIEW_PATIENTS'
  | 'EDIT_PATIENTS'
  | 'VIEW_MEDICAL_RECORDS'
  | 'EDIT_MEDICAL_RECORDS'
  | 'VIEW_PRESCRIPTIONS'
  | 'CREATE_PRESCRIPTIONS'
  | 'VIEW_EXPENSES'
  | 'MANAGE_EXPENSES'
  | 'MANAGE_SETTINGS';

export interface User {
  id: number;
  email: string;
  role: Role;
}

const RolePermissions: Record<Role, Permission[]> = {
  admin: [
    'VIEW_DASHBOARD_STATS', 'MANAGE_USERS', 'VIEW_PATIENTS', 'EDIT_PATIENTS',
    'VIEW_MEDICAL_RECORDS', 'EDIT_MEDICAL_RECORDS', 'VIEW_PRESCRIPTIONS',
    'CREATE_PRESCRIPTIONS', 'VIEW_EXPENSES', 'MANAGE_EXPENSES', 'MANAGE_SETTINGS'
  ],
  doctor: [
    'VIEW_DASHBOARD_STATS', 'VIEW_PATIENTS', 'EDIT_PATIENTS',
    'VIEW_MEDICAL_RECORDS', 'EDIT_MEDICAL_RECORDS', 'VIEW_PRESCRIPTIONS',
    'CREATE_PRESCRIPTIONS', 'VIEW_EXPENSES', 'MANAGE_SETTINGS'
  ],
  receptionist: [
    'VIEW_PATIENTS', 'EDIT_PATIENTS'
  ]
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthed: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthed: false,
  login: () => { },
  logout: () => { },
  loading: true,
  can: () => false,
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

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return RolePermissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthed: !!user,
      login,
      logout,
      loading,
      can
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
