import {
  FaChartPie,
  FaChevronRight,
  FaCog,
  FaEdit,
  FaHeart,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";

function ProfilePage() {
  return (
    <main className="app-page profile-page">
      <section className="profile-hero-card">
        <img
          src="https://api.dicebear.com/7.x/adventurer/svg?seed=cafe-user"
          alt="profile"
        />

        <h1>Cafe Ubon Ratchathani</h1>
        <p>ผู้ใช้ระบบแนะนำคาเฟ่และจุดถ่ายรูป</p>
      </section>

      <section className="profile-layout">
        <div className="profile-menu-card">
          <button type="button">
            <FaEdit />
            <span>แก้ไขโปรไฟล์</span>
            <FaChevronRight />
          </button>

          <button type="button">
            <FaHistory />
            <span>ประวัติการเข้าชม</span>
            <FaChevronRight />
          </button>

          <button type="button">
            <FaHeart />
            <span>รายการโปรด</span>
            <FaChevronRight />
          </button>

          <button type="button">
            <FaCog />
            <span>การตั้งค่า</span>
            <FaChevronRight />
          </button>

          <button type="button">
            <FaSignOutAlt />
            <span>ออกจากระบบ</span>
            <FaChevronRight />
          </button>
        </div>

        <div className="profile-stats-card">
          <h2>
            <FaChartPie /> สถิติการเยี่ยมชม
          </h2>

          <div className="stats-grid">
            <div>
              <strong>12</strong>
              <span>คาเฟ่ที่ดู</span>
            </div>

            <div>
              <strong>5</strong>
              <span>รายการโปรด</span>
            </div>

            <div>
              <strong>3</strong>
              <span>รีวิว</span>
            </div>

            <div>
              <strong>8</strong>
              <span>มุมถ่ายรูป</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;