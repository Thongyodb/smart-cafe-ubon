import { FaChartLine, FaMapMarkedAlt, FaSignOutAlt, FaStore, FaTags } from "react-icons/fa";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";

function AdminLayout() {
  const navigate = useNavigate();
  const adminUser = authStorage.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-icon">
            <FaStore />
          </span>
          <div>
            <strong>Smart Cafe</strong>
            <small>Admin Panel</small>
          </div>
        </Link>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <FaChartLine />
            Dashboard
          </NavLink>

          <NavLink to="/admin/cafes">
            <FaStore />
            จัดการคาเฟ่
          </NavLink>

          <NavLink to="/admin/spots">
            <FaMapMarkedAlt />
            จุดถ่ายรูป
          </NavLink>

          <NavLink to="/admin/tags">
            <FaTags />
            หมวดหมู่/แท็ก
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-box">
            <strong>{adminUser?.fullName ?? "Admin"}</strong>
            <span>{adminUser?.email ?? "admin@smartcafeubon.com"}</span>
          </div>

          <button className="admin-logout-btn" type="button" onClick={handleLogout}>
            <FaSignOutAlt />
            ออกจากระบบ
          </button>

          <Link to="/" className="admin-back-link">
            กลับหน้าเว็บไซต์
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;