import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  isAuthed: boolean;
  setAuthed: (authed: boolean) => void;
}>({
  isAuthed: false,
  setAuthed: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthedState] = useState(false);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("isAuthed");
    setAuthedState(stored === "true");
  }, []);

  // Whenever isAuthed changes, sync it back to localStorage
  const setAuthed = (authed: boolean) => {
    localStorage.setItem("isAuthed", String(authed));
    setAuthedState(authed);
  };

  return (
    <AuthContext.Provider value={{ isAuthed, setAuthed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
