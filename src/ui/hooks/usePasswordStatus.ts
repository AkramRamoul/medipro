import { useEffect, useState, useCallback } from "react";

export function usePasswordStatus() {
  const [status, setStatus] = useState<"loading" | "exists" | "not-exists">(
    "loading"
  );

  const check = useCallback(async () => {
    const exists = await window.electronAPI.checkPasswordExists();
    setStatus(exists ? "exists" : "not-exists");
    return exists ? "exists" : "not-exists";
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, refetch: check };
}
