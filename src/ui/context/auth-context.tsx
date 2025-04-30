import { createContext, useContext, useState } from "react";

const AuthContext = createContext<{
  isAuthed: boolean;
  setAuthed: (authed: boolean) => void;
}>({
  isAuthed: false,
  setAuthed: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);
  return (
    <AuthContext.Provider value={{ isAuthed, setAuthed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
