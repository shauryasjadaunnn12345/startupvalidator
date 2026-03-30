import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const DISABLE_AUTH = import.meta.env.VITE_DISABLE_AUTH === "true";

export function RequireAuth({ children }: { children: JSX.Element }) {
  if (DISABLE_AUTH) {
    return children;
  }

  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
