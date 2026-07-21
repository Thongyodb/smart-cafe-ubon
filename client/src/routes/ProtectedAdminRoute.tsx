import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "../utils/authStorage";

function ProtectedAdminRoute() {
  if (!authStorage.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!authStorage.isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;