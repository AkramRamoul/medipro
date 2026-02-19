import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function RequirePassword({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
