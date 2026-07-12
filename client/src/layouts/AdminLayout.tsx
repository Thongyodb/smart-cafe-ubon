import { NavLink, Outlet, Link } from "react-router-dom";
import {
  FaChartPie,
  FaCoffee,
  FaHome,
  FaMapMarkerAlt,
  FaTags,
} from "react-icons/fa";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <div className="admin-brand-icon">
            <FaCoffee />
          </div>

          <div>
            <strong>Smart Cafe</strong>
            <small>Admin Panel</small>
          </div>
        </Link>

        <nav className="admin-menu">
          <NavLink to="/admin" end>
            <FaChartPie />
            Dashboard
          </NavLink>

          <NavLink to="/admin/cafes">
            <FaCoffee />
            จัดการคาเฟ่
          </NavLink>

          <NavLink to="/admin/spots">
            <FaMapMarkerAlt />
            จุดถ่ายรูป
          </NavLink>

          <NavLink to="/admin/tags">
            <FaTags />
            หมวดหมู่ / Tags
          </NavLink>
        </nav>

        <Link to="/" className="back-to-site">
          <FaHome />
          กลับหน้าเว็บ
        </Link>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;