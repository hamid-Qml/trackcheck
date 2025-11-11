import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { status } = useAuth();
  const loc = useLocation();

  if (status === "idle" || status === "loading") {
    // skeleton/loader—keep minimal
    return <div className="p-8 text-center">Loading…</div>;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return children;
}
