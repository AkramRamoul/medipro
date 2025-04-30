import { useEffect, useState } from "react";

export function usePasswordStatus() {
  const [status, setStatus] = useState<"loading" | "exists" | "not-exists">(
    "loading"
  );

  useEffect(() => {
    async function check() {
      const exists = await window.electronAPI.checkPasswordExists();
      setStatus(exists ? "exists" : "not-exists");
    }

    check();
  }, []);

  return status;
}
