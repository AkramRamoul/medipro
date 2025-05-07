import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { usePasswordStatus } from "../hooks/usePasswordStatus";

export default function RequirePassword({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { isAuthed } = useAuth();
  const passwordStatus = usePasswordStatus();

  if (passwordStatus.status === "loading") return null;

  return passwordStatus.status === "exists" && !isAuthed ? (
    <Navigate to="/enter-password" replace />
  ) : (
    children
  );

  // If no password is set, allow access without auth
}
