import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  isAuthed: boolean;
  setAuthed: (authed: boolean) => void;
  loading: boolean;
}>({
  isAuthed: false,
  setAuthed: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthedState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const exists = await window.electronAPI.checkPasswordExists();

      // If a password exists, user must log in each time
      if (exists) {
        localStorage.removeItem("isAuthed");
        setAuthedState(false);
      } else {
        // No password set → skip auth
        setAuthedState(true);
      }

      setLoading(false);
    };

    init();
  }, []);

  const setAuthed = (authed: boolean) => {
    localStorage.setItem("isAuthed", String(authed));
    setAuthedState(authed);
  };

  return (
    <AuthContext.Provider value={{ isAuthed, setAuthed, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
