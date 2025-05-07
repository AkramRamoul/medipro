import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type PasswordStatus = "loading" | "exists" | "not-exists";

const PasswordStatusContext = createContext<{
  status: PasswordStatus;
  refetch: () => Promise<void>;
}>({
  status: "loading",
  refetch: async () => {},
});

export function PasswordStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<PasswordStatus>("loading");

  const checkStatus = useCallback(async () => {
    const exists = await window.electronAPI.checkPasswordExists();
    setStatus(exists ? "exists" : "not-exists");
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <PasswordStatusContext.Provider value={{ status, refetch: checkStatus }}>
      {children}
    </PasswordStatusContext.Provider>
  );
}

export function usePasswordStatus() {
  return useContext(PasswordStatusContext);
}
