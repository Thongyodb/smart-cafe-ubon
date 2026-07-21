import {
  FaCompass,
  FaHeart,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUser,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { authStorage } from "../../utils/authStorage";

function AppNavigation() {
  const navigate = useNavigate();

  const isLoggedIn = authStorage.isLoggedIn();
  const isAdmin = authStorage.isAdmin();
  const user = authStorage.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <>
      <header className="app-topbar">
        <NavLink to="/" className="app-brand">
          <span className="app-brand-icon">☕</span>

          <div>
            <strong>Smart Cafe Ubon</strong>
            <small>ค้นหาคาเฟ่และจุดถ่ายรูป</small>
          </div>
        </NavLink>

        <nav className="app-desktop-nav">
          <NavLink to="/">
            <FaHome />
            หน้าแรก
          </NavLink>

          {isLoggedIn && (
            <>
              <NavLink to="/explore">
                <FaCompass />
                สำรวจ
              </NavLink>

              <NavLink to="/favorites">
                <FaHeart />
                รายการโปรด
              </NavLink>

              <NavLink to="/profile">
                <FaUser />
                โปรไฟล์
              </NavLink>
            </>
          )}

          {isLoggedIn && isAdmin && (
            <NavLink to="/admin">
              <FaTachometerAlt />
              แดชบอร์ดผู้ดูแลระบบ
            </NavLink>
          )}

          {!isLoggedIn ? (
            <NavLink to="/login" className="app-login-link">
              <FaSignInAlt />
              เข้าสู่ระบบ
            </NavLink>
          ) : (
            <button className="app-logout-link" type="button" onClick={handleLogout}>
              <FaSignOutAlt />
              ออกจากระบบ
            </button>
          )}
        </nav>

        {isLoggedIn && (
          <div className="app-user-mini">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} />
            ) : (
              <span>{user?.fullName?.charAt(0).toUpperCase() ?? "U"}</span>
            )}

            <div>
              <strong>{user?.fullName ?? user?.username ?? "User"}</strong>
              <small>{user?.role === "ADMIN" ? "Admin" : "Member"}</small>
            </div>
          </div>
        )}
      </header>

      <nav className="app-bottom-nav">
        <NavLink to="/">
          <FaHome />
          <span>หน้าแรก</span>
        </NavLink>

        {isLoggedIn && (
          <>
            <NavLink to="/explore">
              <FaCompass />
              <span>สำรวจ</span>
            </NavLink>

            <NavLink to="/favorites">
              <FaHeart />
              <span>โปรด</span>
            </NavLink>

            <NavLink to="/profile">
              <FaUser />
              <span>โปรไฟล์</span>
            </NavLink>
          </>
        )}

        {isLoggedIn && isAdmin && (
          <NavLink to="/admin">
            <FaTachometerAlt />
            <span>Admin</span>
          </NavLink>
        )}

        {!isLoggedIn && (
          <NavLink to="/login">
            <FaSignInAlt />
            <span>เข้าสู่ระบบ</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}

export default AppNavigation;