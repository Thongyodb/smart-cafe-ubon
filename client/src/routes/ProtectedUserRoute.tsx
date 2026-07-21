import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "../utils/authStorage";

function ProtectedUserRoute() {
  if (!authStorage.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedUserRoute;