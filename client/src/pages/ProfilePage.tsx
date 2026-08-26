import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  FaCamera,
  FaEnvelope,
  FaHeart,
  FaImage,
  FaPen,
  FaPhone,
  FaRegCommentDots,
  FaSave,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { favoriteService } from "../services/favoriteService";
import { userService, type ProfileUser } from "../services/userService";
import { authStorage } from "../utils/authStorage";

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

const toNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
};

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<ProfileUser | null>(
    authStorage.getUser() as ProfileUser | null
  );

  const [favoriteCount, setFavoriteCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState("");

  const [avatarFocusX, setAvatarFocusX] = useState(50);
  const [avatarFocusY, setAvatarFocusY] = useState(50);
  const [avatarZoom, setAvatarZoom] = useState(1);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const syncUserToStorage = (nextUser: ProfileUser) => {
    const token = authStorage.getToken();

    if (token) {
      authStorage.setAuth(token, nextUser);
    }

    setUser(nextUser);
    window.dispatchEvent(new Event("smart-cafe-auth-change"));
  };

  const openEditProfile = () => {
    if (!user) {
      return;
    }

    setEditFullName(user.fullName || user.username || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditAvatarFile(null);
    setEditAvatarPreview(getImageUrl(user.avatarUrl));

    setAvatarFocusX(toNumber(user.avatarFocusX, 50));
    setAvatarFocusY(toNumber(user.avatarFocusY, 50));
    setAvatarZoom(toNumber(user.avatarZoom, 1));

    setIsEditing(true);
  };

  const closeEditProfile = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setEditAvatarFile(selectedFile);
    setEditAvatarPreview(previewUrl);
    setAvatarFocusX(50);
    setAvatarFocusY(50);
    setAvatarZoom(1);

    event.target.value = "";
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!editFullName.trim()) {
      alert("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    const formData = new FormData();

    formData.append("fullName", editFullName.trim());
    formData.append("email", editEmail.trim());
    formData.append("phone", editPhone.trim());
    formData.append("avatarUrl", user.avatarUrl ?? "");
    formData.append("avatarFocusX", String(avatarFocusX));
    formData.append("avatarFocusY", String(avatarFocusY));
    formData.append("avatarZoom", String(avatarZoom));

    if (editAvatarFile) {
      formData.append("avatar", editAvatarFile);
    }

    try {
      setSavingProfile(true);

      const result = await userService.updateMe(formData);

      syncUserToStorage(result.data);
      setIsEditing(false);

      alert("บันทึกข้อมูลโปรไฟล์สำเร็จ");
    } catch {
      alert("บันทึกข้อมูลโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    userService
      .getMe()
      .then((result) => {
        if (!isMounted) {
          return;
        }

        const nextUser = result.data;
        const token = authStorage.getToken();

        if (token) {
          authStorage.setAuth(token, nextUser);
        }

        setUser(nextUser);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setUser(authStorage.getUser() as ProfileUser | null);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingProfile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    favoriteService
      .getFavorites()
      .then((favoriteResult) => {
        if (!isMounted) {
          return;
        }

        setFavoriteCount(favoriteResult.data?.length ?? 0);

        /*
          ตอนนี้ยังไม่มี API แยกสำหรับนับรีวิว/รูปรีวิวของผู้ใช้
          จึงตั้งไว้เป็น 0 ก่อน เดี๋ยวค่อยเพิ่ม API ภายหลังได้
        */
        setReviewCount(0);
        setGalleryCount(0);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setFavoriteCount(0);
        setReviewCount(0);
        setGalleryCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (loadingProfile) {
    return (
      <main className="profile-redesign-page">
        <section className="profile-empty-card">
          <h1>กำลังโหลดโปรไฟล์...</h1>
          <p>กรุณารอสักครู่</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-redesign-page">
        <section className="profile-empty-card">
          <h1>ยังไม่ได้เข้าสู่ระบบ</h1>
          <p>กรุณาเข้าสู่ระบบก่อนใช้งานหน้าโปรไฟล์</p>

          <Link to="/login" className="profile-primary-btn">
            เข้าสู่ระบบ
          </Link>
        </section>
      </main>
    );
  }

  const displayName = user.fullName || user.username || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const avatarUrl = getImageUrl(user.avatarUrl);
  const currentAvatarFocusX = toNumber(user.avatarFocusX, 50);
  const currentAvatarFocusY = toNumber(user.avatarFocusY, 50);
  const currentAvatarZoom = toNumber(user.avatarZoom, 1);

  const membershipTitle = isAdmin ? "ADMIN STATUS" : "MEMBERSHIP STATUS";

  const membershipText = isAdmin
    ? "ผู้ดูแลระบบ สามารถจัดการข้อมูลคาเฟ่และดูแดชบอร์ดได้"
    : "สมาชิกทั่วไป สามารถสำรวจคาเฟ่ บันทึกรายการโปรด และใช้งานโปรไฟล์ได้";

  return (
    <main className="profile-redesign-page">
      <section className="profile-redesign-container">
        <div className="profile-redesign-hero">
          <div className="profile-avatar-zone">
            <div className="profile-large-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  style={{
                    objectPosition: `${currentAvatarFocusX}% ${currentAvatarFocusY}%`,
                    transform: `scale(${currentAvatarZoom})`,
                    transformOrigin: `${currentAvatarFocusX}% ${currentAvatarFocusY}%`,
                  }}
                />
              ) : (
                <span>{firstLetter}</span>
              )}
            </div>

            <button
              className="profile-avatar-edit-btn"
              type="button"
              onClick={openEditProfile}
              aria-label="แก้ไขรูปโปรไฟล์"
            >
              <FaCamera />
            </button>
          </div>

          <div className="profile-user-info">
            <h1>{displayName}</h1>

            <div className="profile-contact-row">
              <span>
                <FaEnvelope />
                {user.email || "ยังไม่ได้เพิ่ม Email"}
              </span>

              <span>
                <FaPhone />
                {user.phone || "ยังไม่ได้เพิ่มเบอร์โทร"}
              </span>
            </div>
          </div>

          <div className="profile-action-buttons">
            <button
              className="profile-edit-btn"
              type="button"
              onClick={openEditProfile}
            >
              <FaPen />
              Edit Profile
            </button>

            <button
              className="profile-signout-btn"
              type="button"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              Sign Out
            </button>
          </div>
        </div>

        <div className="profile-stat-grid">
          <ProfileStatCard
            icon={<FaHeart />}
            number={favoriteCount}
            label="Favorites"
          />

          <ProfileStatCard
            icon={<FaRegCommentDots />}
            number={reviewCount}
            label="Reviews"
          />

          <ProfileStatCard
            icon={<FaImage />}
            number={galleryCount}
            label="Gallery"
          />
        </div>

        <section className="profile-membership-card">
          <div className="profile-membership-icon">
            {isAdmin ? <FaUserCircle /> : <FaImage />}
          </div>

          <div>
            <span>{membershipTitle}</span>
            <p>{membershipText}</p>
          </div>
        </section>
      </section>

      {isEditing && (
        <div className="profile-edit-backdrop" onClick={closeEditProfile}>
          <form
            className="profile-edit-modal profile-edit-modal-wide"
            onSubmit={handleSaveProfile}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-edit-modal-header">
              <div>
                <span>Edit Profile</span>
                <h2>แก้ไขโปรไฟล์</h2>
              </div>

              <button type="button" onClick={closeEditProfile}>
                <FaTimes />
              </button>
            </div>

            <div className="profile-edit-layout">
              <div className="profile-avatar-crop-area">
                <div className="profile-avatar-crop-preview">
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt="avatar preview"
                      style={{
                        objectPosition: `${avatarFocusX}% ${avatarFocusY}%`,
                        transform: `scale(${avatarZoom})`,
                        transformOrigin: `${avatarFocusX}% ${avatarFocusY}%`,
                      }}
                    />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                </div>

                <label className="profile-avatar-upload-btn">
                  <FaCamera />
                  เปลี่ยนรูปโปรไฟล์
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>

                <div className="profile-crop-controls">
                  <label>
                    ซ้าย / ขวา
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={avatarFocusX}
                      onChange={(event) =>
                        setAvatarFocusX(Number(event.target.value))
                      }
                    />
                  </label>

                  <label>
                    บน / ล่าง
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={avatarFocusY}
                      onChange={(event) =>
                        setAvatarFocusY(Number(event.target.value))
                      }
                    />
                  </label>

                  <label>
                    ซูม
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={avatarZoom}
                      onChange={(event) =>
                        setAvatarZoom(Number(event.target.value))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="profile-edit-fields">
                <label>
                  ชื่อผู้ใช้
                  <input
                    value={editFullName}
                    onChange={(event) => setEditFullName(event.target.value)}
                    placeholder="กรอกชื่อผู้ใช้"
                  />
                </label>

                <label>
                  Email
                  <input
                    value={editEmail}
                    onChange={(event) => setEditEmail(event.target.value)}
                    placeholder="example@email.com"
                    type="email"
                  />
                </label>

                <label>
                  Phone
                  <input
                    value={editPhone}
                    onChange={(event) => setEditPhone(event.target.value)}
                    placeholder="กรอกเบอร์โทร"
                    type="tel"
                  />
                </label>

                <button
                  className="profile-save-btn"
                  type="submit"
                  disabled={savingProfile}
                >
                  <FaSave />
                  {savingProfile ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function ProfileStatCard({
  icon,
  number,
  label,
}: {
  icon: ReactNode;
  number: number;
  label: string;
}) {
  return (
    <article className="profile-stat-card">
      <div>{icon}</div>
      <strong>{number}</strong>
      <span>{label}</span>
    </article>
  );
}

export default ProfilePage;