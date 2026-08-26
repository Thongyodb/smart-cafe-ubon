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

const API_BASE_URL = "http://localhost:5000";

const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

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
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const displayName = user?.fullName || user?.username || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = getImageUrl(user?.avatarUrl);

  const avatarFocusX = user?.avatarFocusX ?? 50;
  const avatarFocusY = user?.avatarFocusY ?? 50;
  const avatarZoom = user?.avatarZoom ?? 1;

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

        <div
          className="top-nav-right-area"
          style={{
            width: 220,
            minWidth: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
          }}
        >
          {isLoggedIn && isAdmin && (
            <NavLink to="/admin" className="admin-top-button">
              Admin
            </NavLink>
          )}

          {isLoggedIn && !isAdmin && (
            <NavLink
              to="/profile"
              className="top-user-profile-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: "#171717",
                textDecoration: "none",
                background: "transparent",
                border: 0,
                boxShadow: "none",
                padding: 0,
                margin: 0,
              }}
            >
              <div
                className="top-user-avatar"
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: "999px",
                  overflow: "hidden",
                  background: "#087b76",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1,
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                  position: "relative",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `${avatarFocusX}% ${avatarFocusY}%`,
                      transform: `scale(${avatarZoom})`,
                      transformOrigin: `${avatarFocusX}% ${avatarFocusY}%`,
                      display: "block",
                    }}
                  />
                ) : (
                  avatarLetter
                )}
              </div>

              <strong
                className="top-user-name"
                style={{
                  display: "inline-block",
                  color: "#171717",
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                {displayName}
              </strong>
            </NavLink>
          )}
        </div>
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