import { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

const AuthContext = createContext<{
  isAuthed: boolean;
  setAuthed: (authed: boolean) => void;
  loading: boolean;
}>({
  isAuthed: false,
  setAuthed: () => { },
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthedState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get('/users/check-password-exists');

        if (data.exists) {
          // Check if user was previously authenticated in this session
          const savedAuth = localStorage.getItem("isAuthed");
          if (savedAuth === "true") {
            setAuthedState(true);
          } else {
            setAuthedState(false);
          }
        } else {
          setAuthedState(true);
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        // Default to authed if check fails (user can set password later)
        setAuthedState(true);
      } finally {
        setLoading(false);
      }
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
