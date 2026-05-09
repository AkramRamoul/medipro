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
  requiresPasswordChange?: boolean;
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
  const dummyUser: User = { id: 1, email: 'admin@local', role: 'admin' };
  const [user, setUser] = useState<User | null>(dummyUser);
  const [token, setToken] = useState<string | null>('dummy-token');
  const [loading, setLoading] = useState(false);

  const login = (newToken: string, newUser: User) => {
    // No-op for single user mode
  };

  const logout = () => {
    // No-op for single user mode
  };

  useEffect(() => {
    // No auth init needed
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
