import {
  FaCompass,
  FaHeart,
  FaIdBadge,
  FaShieldAlt,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";

function ProfilePage() {
  const navigate = useNavigate();
  const user = authStorage.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-empty-card">
          <h1>ยังไม่ได้เข้าสู่ระบบ</h1>
          <p>กรุณาเข้าสู่ระบบก่อนใช้งานหน้าโปรไฟล์</p>
          <Link to="/login" className="admin-primary-btn">
            เข้าสู่ระบบ
          </Link>
        </section>
      </main>
    );
  }

  const displayName = user.fullName || user.username || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <section className="profile-hero-card">
        <div className="profile-avatar-large">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} />
          ) : (
            <span>{firstLetter}</span>
          )}
        </div>

        <div>
          <span className="admin-eyebrow">My Profile</span>
          <h1>{displayName}</h1>
          <p>
            {user.role === "ADMIN"
              ? "ผู้ดูแลระบบ สามารถจัดการข้อมูลคาเฟ่และดูแดชบอร์ดได้"
              : "สมาชิกทั่วไป สามารถสำรวจคาเฟ่ บันทึกรายการโปรด และใช้งานโปรไฟล์ได้"}
          </p>
        </div>
      </section>

      <section className="profile-grid">
        <div className="profile-info-card">
          <h2>ข้อมูลบัญชี</h2>

          <div className="profile-info-list">
            <div>
              <span>
                <FaUserCircle />
                Username
              </span>
              <strong>{user.username ?? "-"}</strong>
            </div>

            <div>
              <span>
                <FaIdBadge />
                ชื่อที่แสดง
              </span>
              <strong>{displayName}</strong>
            </div>

            <div>
              <span>
                <FaShieldAlt />
                สิทธิ์ผู้ใช้งาน
              </span>
              <strong>{user.role === "ADMIN" ? "Admin" : "Member"}</strong>
            </div>
          </div>
        </div>

        <div className="profile-action-card">
          <h2>เมนูของฉัน</h2>

          <div className="profile-menu-list">
            <Link to="/explore">
              <FaCompass />
              สำรวจคาเฟ่
            </Link>

            <Link to="/favorites">
              <FaHeart />
              รายการโปรด
            </Link>

            {user.role === "ADMIN" && (
              <Link to="/admin">
                <FaTachometerAlt />
                แดชบอร์ดผู้ดูแลระบบ
              </Link>
            )}

            <button type="button" onClick={handleLogout}>
              <FaSignOutAlt />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;