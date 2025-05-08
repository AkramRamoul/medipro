import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { usePasswordStatus } from "../hooks/usePasswordStatus";

export default function RequirePassword({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { isAuthed, loading } = useAuth();
  const passwordStatus = usePasswordStatus();

  if (loading || passwordStatus.status === "loading") return null;

  return passwordStatus.status === "exists" && !isAuthed ? (
    <Navigate to="/enter-password" replace />
  ) : (
    children
  );
}
