import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function RequirePassword({
  children,
}: {
  children: React.JSX.Element;
}) {
  return children;
}
