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

  if (passwordStatus === "loading") return null; // or a loading spinner

  // If no password is set, allow access without auth
  if (passwordStatus === "not-exists") return children;

  // If password exists but not authenticated
  return isAuthed ? children : <Navigate to="/enter-password" replace />;
}
