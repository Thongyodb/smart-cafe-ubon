import { useState } from "react";
import type { FormEvent } from "react";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState(initialMode === "login" ? "admin" : "");
  const [password, setPassword] = useState(
    initialMode === "login" ? "Admin@123456" : ""
  );
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goAfterLogin = () => {
    if (authStorage.isAdmin()) {
      navigate("/admin");
      return;
    }

    navigate("/");
  };

  const switchToLogin = () => {
    setMode("login");
    setUsername("admin");
    setPassword("Admin@123456");
    setConfirmPassword("");
    navigate("/login", { replace: true });
  };

  const switchToRegister = () => {
    setMode("register");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    navigate("/login?mode=register", { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      if (mode === "login") {
        await authService.login(username, password);
      } else {
        if (password !== confirmPassword) {
          alert("Password และ Confirm Password ต้องตรงกัน");
          return;
        }

        await authService.register(username, password, confirmPassword);
      }

      goAfterLogin();
    } catch {
      alert(
        mode === "login"
          ? "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบ Username หรือ Password"
          : "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} Login จะทำในขั้นตอนถัดไป หลังจากเตรียม Client ID / App ID`);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="admin-eyebrow">Smart Cafe Ubon</span>

        <h1>{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h1>
        <p>
          เข้าสู่ระบบเพื่อใช้งานสำรวจคาเฟ่ รายการโปรด โปรไฟล์ และฟีเจอร์สมาชิก
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={switchToLogin}
          >
            เข้าสู่ระบบ
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={switchToRegister}
          >
            สมัครสมาชิก
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="กรอก username"
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="กรอกรหัสผ่าน"
              type="password"
            />
          </label>

          {mode === "register" && (
            <label>
              Confirm Password
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="ยืนยันรหัสผ่าน"
                type="password"
              />
            </label>
          )}

          <button className="admin-primary-btn" type="submit" disabled={loading}>
            {loading ? (
              "กำลังดำเนินการ..."
            ) : mode === "login" ? (
              <>
                <FaSignInAlt />
                เข้าสู่ระบบ
              </>
            ) : (
              <>
                <FaUserPlus />
                สมัครสมาชิก
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>หรือเข้าสู่ระบบด้วย</span>
        </div>

        <div className="social-login-grid">
          <button type="button" onClick={() => handleSocialLogin("Google")}>
            <FaGoogle />
            Google
          </button>

          <button type="button" onClick={() => handleSocialLogin("Facebook")}>
            <FaFacebookF />
            Facebook
          </button>

          <button type="button" onClick={() => handleSocialLogin("Instagram")}>
            <FaInstagram />
            Instagram
          </button>
        </div>

        <div className="admin-login-hint">
          <FaLock />
          <span>Admin ใช้ username/password ที่กำหนดไว้เพื่อเข้าแดชบอร์ด</span>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;