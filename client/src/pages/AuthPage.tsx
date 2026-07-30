import { useState } from "react";
import type { FormEvent } from "react";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goAfterLogin = () => {
    window.dispatchEvent(new Event("smart-cafe-auth-change"));

    if (authStorage.isAdmin()) {
      navigate("/admin");
      return;
    }

    navigate("/");
  };

  const clearForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const switchToLogin = () => {
    setMode("login");
    clearForm();
    navigate("/login", { replace: true });
  };

  const switchToRegister = () => {
    setMode("register");
    clearForm();
    navigate("/login?mode=register", { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      if (mode === "login") {
        await authService.login(username.trim(), password);
      } else {
        if (password !== confirmPassword) {
          alert("Password และ Confirm Password ต้องตรงกัน");
          return;
        }

        await authService.register(username.trim(), password, confirmPassword);
      }

      clearForm();
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

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="กรอก username"
              autoComplete="off"
              name="smart-cafe-username"
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="กรอกรหัสผ่าน"
              type="password"
              autoComplete="new-password"
              name="smart-cafe-password"
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
                autoComplete="new-password"
                name="smart-cafe-confirm-password"
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
      </section>
    </main>
  );
}

export default AuthPage;