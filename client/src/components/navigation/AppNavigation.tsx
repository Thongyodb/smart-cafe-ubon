import { NavLink } from "react-router-dom";
import { FaCompass, FaHeart, FaHome, FaRegUser } from "react-icons/fa";

function AppNavigation() {
  return (
    <>
      <nav className="desktop-nav">
        <div className="desktop-nav-inner">
          <NavLink to="/" className="brand-link">
            <span className="brand-icon">☕</span>
            <div>
              <strong>Cafe Ubon</strong>
              <small>Ratchathani</small>
            </div>
          </NavLink>

          <div className="desktop-menu">
            <NavLink to="/" end>
              หน้าแรก
            </NavLink>
            <NavLink to="/explore">สำรวจ</NavLink>
            <NavLink to="/favorites">รายการโปรด</NavLink>
            <NavLink to="/profile">โปรไฟล์</NavLink>
          </div>
        </div>
      </nav>

      <nav className="bottom-nav">
        <NavLink to="/" end>
          <FaHome />
          <span>หน้าแรก</span>
        </NavLink>

        <NavLink to="/explore">
          <FaCompass />
          <span>สำรวจ</span>
        </NavLink>

        <NavLink to="/favorites">
          <FaHeart />
          <span>รายการโปรด</span>
        </NavLink>

        <NavLink to="/profile">
          <FaRegUser />
          <span>โปรไฟล์</span>
        </NavLink>
      </nav>
    </>
  );
}

export default AppNavigation;