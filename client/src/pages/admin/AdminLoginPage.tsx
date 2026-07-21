import { useState } from "react";
import type { FormEvent } from "react";
import { FaLock, FaSignInAlt, FaStore } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@smartcafeubon.com");
  const [password, setPassword] = useState("Admin@123456");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      await authService.loginAdmin(email, password);

      navigate("/admin");
    } catch {
      alert("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-logo">
          <FaStore />
        </div>

        <span className="admin-eyebrow">Smart Cafe Ubon</span>
        <h1>เข้าสู่ระบบผู้ดูแล</h1>
        <p>สำหรับจัดการข้อมูลคาเฟ่ รูปภาพ จุดถ่ายรูป และข้อมูลระบบ</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            อีเมลผู้ดูแล
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@smartcafeubon.com"
              type="email"
            />
          </label>

          <label>
            รหัสผ่าน
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin@123456"
              type="password"
            />
          </label>

          <button className="admin-primary-btn" type="submit" disabled={loading}>
            {loading ? (
              "กำลังเข้าสู่ระบบ..."
            ) : (
              <>
                <FaSignInAlt />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        <div className="admin-login-hint">
          <FaLock />
          <span>เฉพาะผู้ดูแลระบบเท่านั้น</span>
        </div>
      </section>
    </main>
  );
}

export default AdminLoginPage;