import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}