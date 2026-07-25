import {
  FaChartLine,
  FaComments,
  FaMapMarkedAlt,
  FaSignOutAlt,
  FaStore,
  FaTags,
  FaUsers,
} from "react-icons/fa";
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
          <div className="admin-brand-icon">
            <FaStore />
          </div>

          <div>
            <strong>Smart Cafe</strong>
            <span>Admin Panel</span>
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

          <NavLink to="/admin/users">
            <FaUsers />
            จัดการสมาชิก
          </NavLink>

          <NavLink to="/admin/spots">
            <FaMapMarkedAlt />
            จุดถ่ายรูป
          </NavLink>

          <NavLink to="/admin/tags">
            <FaTags />
            หมวดหมู่/แท็ก
          </NavLink>

          <NavLink to="/admin/reviews">
            <FaComments />
            จัดการรีวิว
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-mini">
            <strong>{adminUser?.fullName ?? "Smart Cafe Admin"}</strong>
            <span>@{adminUser?.username ?? "admin"}</span>
          </div>

          <button
            className="admin-logout-btn"
            type="button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            ออกจากระบบ
          </button>

          <Link to="/" className="admin-back-site">
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