import { useMemo, useSyncExternalStore } from "react";
import { NavLink } from "react-router-dom";
import {
  FaCoffee,
  FaCog,
  FaCompass,
  FaHeart,
  FaHome,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";
import { authStorage } from "../../utils/authStorage";
import type { AuthUser } from "../../utils/authStorage";

const AUTH_TOKEN_KEY = "smart_cafe_auth_token";
const AUTH_USER_KEY = "smart_cafe_auth_user";

const subscribeAuth = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  window.addEventListener("smart-cafe-auth-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
    window.removeEventListener("smart-cafe-auth-change", callback);
  };
};

const getAuthSnapshot = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
  const user = localStorage.getItem(AUTH_USER_KEY) ?? "";

  return `${token}|${user}`;
};

function AppNavigation() {
  const authSnapshot = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthSnapshot
  );

  const token = useMemo(() => authStorage.getToken(), [authSnapshot]);
  const user = useMemo<AuthUser | null>(
    () => authStorage.getUser(),
    [authSnapshot]
  );

  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.role === "ADMIN";

  const displayName = user?.fullName || user?.username || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="app-topbar">
        <NavLink to="/" className="app-brand">
          <div className="app-brand-icon">
            <FaCoffee />
          </div>

          <div>
            <strong>SMART CAFE UBON</strong>
            <small>ค้นหาคาเฟ่และจุดถ่ายรูป</small>
          </div>
        </NavLink>

        <nav className="app-desktop-nav">
          <NavLink to="/" end>
            <FaHome />
            Home
          </NavLink>

          {isLoggedIn && (
            <>
              <NavLink to="/explore">
                <FaCompass />
                Explore
              </NavLink>

              <NavLink to="/favorites">
                <FaHeart />
                Favorite
              </NavLink>

              <NavLink to="/profile">
                <FaUser />
                Profile
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className="dashboard-nav-link">
                  <FaCog />
                  Dashboard
                </NavLink>
              )}
            </>
          )}

          {!isLoggedIn && (
            <NavLink to="/login" className="app-login-link">
              <FaSignInAlt />
              Sign In
            </NavLink>
          )}
        </nav>

        {isLoggedIn && isAdmin && (
          <NavLink to="/admin" className="admin-top-button">
            Admin
          </NavLink>
        )}

        {isLoggedIn && !isAdmin && (
          <div className="app-user-mini">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} />
            ) : (
              <span>{avatarLetter}</span>
            )}

            <div>
              <strong>{displayName}</strong>
              <small>Member</small>
            </div>
          </div>
        )}
      </header>

      <nav className="app-bottom-nav">
        <NavLink to="/" end>
          <FaHome />
          <span>Home</span>
        </NavLink>

        {isLoggedIn ? (
          <>
            <NavLink to="/explore">
              <FaCompass />
              <span>Explore</span>
            </NavLink>

            <NavLink to="/favorites">
              <FaHeart />
              <span>Favorite</span>
            </NavLink>

            <NavLink to="/profile">
              <FaUser />
              <span>Profile</span>
            </NavLink>
          </>
        ) : (
          <NavLink to="/login">
            <FaSignInAlt />
            <span>Sign In</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}

export default AppNavigation;