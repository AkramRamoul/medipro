import { useEffect, useState, useCallback } from "react";
import api from "../axios";

export function usePasswordStatus() {
  const [status, setStatus] = useState<"loading" | "exists" | "not-exists">(
    "loading"
  );

  const check = useCallback(async () => {
    const { data } = await api.get("/users/check-password-exists");
    setStatus(data.exists ? "exists" : "not-exists");
    return data.exists ? "exists" : "not-exists";
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, refetch: check };
}
