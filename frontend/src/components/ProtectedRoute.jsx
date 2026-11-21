import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth.js";

function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <span className="auth-loading-spinner" aria-hidden="true" />
        Checking your session…
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
