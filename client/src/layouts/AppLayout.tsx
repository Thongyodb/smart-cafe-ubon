import { Outlet } from "react-router-dom";
import AppNavigation from "../components/navigation/AppNavigation";

function AppLayout() {
  return (
    <div className="app-layout">
      <AppNavigation />

      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;