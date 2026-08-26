import { useRef, useState } from "react";
import type { FormEvent } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "";

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const resetRecaptcha = () => {
    setRecaptchaToken("");
    recaptchaRef.current?.reset();
  };

  const goAfterLogin = () => {
    window.dispatchEvent(new Event("smart-cafe-auth-change"));

    if (authStorage.isAdmin()) {
      navigate("/admin");
      return;
    }

    navigate("/");
  };

  const clearForm = () => {
    setLoginIdentifier("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    resetRecaptcha();
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

    if (!RECAPTCHA_SITE_KEY) {
      alert("ยังไม่ได้ตั้งค่า VITE_RECAPTCHA_SITE_KEY ใน client/.env");
      return;
    }

    if (!recaptchaToken) {
      alert("กรุณายืนยัน reCAPTCHA ก่อนดำเนินการ");
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        if (!loginIdentifier.trim() || !password.trim()) {
          alert("กรุณากรอก Username / Email / Phone และ Password");
          return;
        }

        await authService.login(
          loginIdentifier.trim(),
          password,
          recaptchaToken
        );
      } else {
        if (
          !username.trim() ||
          !email.trim() ||
          !phone.trim() ||
          !password.trim() ||
          !confirmPassword.trim()
        ) {
          alert("กรุณากรอกข้อมูลสมัครสมาชิกให้ครบถ้วน");
          return;
        }

        if (password !== confirmPassword) {
          alert("Password และ Confirm Password ต้องตรงกัน");
          return;
        }

        await authService.register({
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          recaptchaToken,
        });
      }

      clearForm();
      goAfterLogin();
    } catch {
      resetRecaptcha();

      alert(
        mode === "login"
          ? "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล หรือยืนยัน reCAPTCHA ใหม่"
          : "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูล หรือยืนยัน reCAPTCHA ใหม่"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="admin-eyebrow">Smart Cafe Ubon</span>

        <h1>{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h1>

        <p>
          {mode === "login"
            ? "เข้าสู่ระบบด้วย Username, Email หรือเบอร์โทรศัพท์ เพื่อใช้งานฟีเจอร์สมาชิก"
            : "สมัครสมาชิกเพื่อบันทึกรายการโปรด เขียนรีวิว และใช้งานระบบ Smart Cafe Ubon"}
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

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          {mode === "login" ? (
            <label>
              Username / Email / Phone
              <input
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                placeholder="กรอก username, email หรือเบอร์โทร"
                autoComplete="off"
                name="smart-cafe-login-identifier"
              />
            </label>
          ) : (
            <>
              <label>
                Username
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="กรอก username"
                  autoComplete="off"
                  name="smart-cafe-register-username"
                />
              </label>

              <label>
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="กรอก email"
                  type="email"
                  autoComplete="off"
                  name="smart-cafe-register-email"
                />
              </label>

              <label>
                Phone number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  type="tel"
                  autoComplete="off"
                  name="smart-cafe-register-phone"
                />
              </label>
            </>
          )}

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

          <div className="auth-recaptcha-wrap">
            {RECAPTCHA_SITE_KEY ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token ?? "")}
                onExpired={resetRecaptcha}
              />
            ) : (
              <div className="auth-recaptcha-missing">
                ยังไม่ได้ตั้งค่า reCAPTCHA Site Key
              </div>
            )}
          </div>

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
      </section>
    </main>
  );
}

export default AuthPage;