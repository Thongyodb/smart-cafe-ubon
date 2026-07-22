import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaHeart,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSearch,
  FaSignInAlt,
  FaStore,
  FaTachometerAlt,
  FaUserPlus,
} from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import CafeFilterBar from "../components/app/CafeFilterBar";
import type { CafeFilterState } from "../components/app/CafeFilterBar";
import LeafletMapView from "../components/app/LeafletMapView";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";
import { authStorage } from "../utils/authStorage";

const defaultFilters: CafeFilterState = {
  tagIds: [],
};

function HomePage() {
  const navigate = useNavigate();

  const isLoggedIn = authStorage.isLoggedIn();
  const isAdmin = authStorage.isAdmin();
  const user = authStorage.getUser();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CafeFilterState>(defaultFilters);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [nearbyMessage, setNearbyMessage] = useState("");
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const loadCafes = async (nextFilters = filters) => {
    const result = await cafeService.getCafes({
      search,
      categoryId: nextFilters.categoryId,
      districtId: nextFilters.districtId,
      tagIds: nextFilters.tagIds,
    });

    setCafes(result.data);
    setIsNearbyMode(false);
    setNearbyMessage("");
    setUserLocation(null);
  };

  const handleFilterChange = async (nextFilters: CafeFilterState) => {
    setFilters(nextFilters);
    await loadCafes(nextFilters);
  };

  const handleClearFilters = async () => {
    setSearch("");
    setFilters(defaultFilters);

    const result = await cafeService.getCafes({
      tagIds: [],
    });

    setCafes(result.data);
    setIsNearbyMode(false);
    setNearbyMessage("");
    setUserLocation(null);
  };

  const handleNearby = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!navigator.geolocation) {
      setNearbyMessage("เบราว์เซอร์นี้ไม่รองรับการค้นหาตำแหน่ง");
      return;
    }

    setLoadingNearby(true);
    setNearbyMessage("กำลังค้นหาร้านใกล้คุณ...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({ lat, lng });

          const result = await cafeService.getNearbyCafes(lat, lng, 20);

          setCafes(result.data);
          setIsNearbyMode(true);
          setNearbyMessage(`พบคาเฟ่ใกล้คุณ ${result.count} ร้าน ภายใน 20 km`);
        } catch {
          setNearbyMessage("ไม่สามารถโหลดคาเฟ่ใกล้คุณได้");
        } finally {
          setLoadingNearby(false);
        }
      },
      () => {
        setLoadingNearby(false);
        setNearbyMessage(
          "ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาต Location ใน Browser"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    let isMounted = true;

    cafeService
      .getCafes({
        tagIds: [],
      })
      .then((result) => {
        if (isMounted) {
          setCafes(result.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCafes([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-page home-page">
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="app-header">
            <div>
              <span className="eyebrow">Cafe Ubon Ratchathani</span>
              <h1>ค้นหาคาเฟ่และจุดถ่ายรูปในอุบลราชธานี</h1>

              {isLoggedIn ? (
                <p className="home-welcome-text">
                  ยินดีต้อนรับ {user?.fullName ?? user?.username ?? "สมาชิก"}{" "}
                  เข้าสู่ระบบแนะนำคาเฟ่
                </p>
              ) : (
                <p className="home-welcome-text">
                  สมัครสมาชิกหรือเข้าสู่ระบบก่อน เพื่อใช้งานสำรวจคาเฟ่
                  รายการโปรด โปรไฟล์ และค้นหาร้านใกล้คุณ
                </p>
              )}
            </div>

            {isLoggedIn ? (
              user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="profile" className="app-avatar" />
              ) : (
                <div className="app-avatar app-avatar-letter">
                  {(user?.fullName ?? user?.username ?? "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )
            ) : (
              <img
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=cafe"
                alt="profile"
                className="app-avatar"
              />
            )}
          </div>

          {isLoggedIn ? (
            <>
              <form
                className="app-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  loadCafes();
                }}
              >
                <FaSearch />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาคาเฟ่ หรือโทนสีที่ชอบ..."
                />

                <button type="submit">ค้นหา</button>
              </form>

              <CafeFilterBar
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </>
          ) : (
            <div className="home-auth-card">
              <h2>เริ่มใช้งาน Smart Cafe Ubon</h2>
              <p>
                เข้าสู่ระบบหรือสมัครสมาชิกเพื่อปลดล็อกฟีเจอร์ทั้งหมดของระบบ
              </p>

              <div className="home-auth-actions">
                <button type="button" onClick={() => navigate("/login")}>
                  <FaSignInAlt />
                  เข้าสู่ระบบ
                </button>

                <button type="button" onClick={() => navigate("/login?mode=register")}>
                  <FaUserPlus />
                  สมัครสมาชิก
                </button>
              </div>
            </div>
          )}

          <div className="quick-actions">
            {isLoggedIn ? (
              <>
                <button type="button" onClick={() => navigate("/explore")}>
                  <FaStore />
                  <span>Explore Cafes</span>
                </button>

                <button type="button" onClick={() => navigate("/favorites")}>
                  <FaHeart />
                  <span>Saved Spots</span>
                </button>

                <button
                  type="button"
                  onClick={handleNearby}
                  disabled={loadingNearby}
                >
                  <FaMapMarkerAlt />
                  <span>{loadingNearby ? "Finding..." : "Nearby"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert("ฟีเจอร์ Posing Guide จะทำในขั้นตอนถัดไป")
                  }
                >
                  <FaCamera />
                  <span>Posing Guide</span>
                </button>

                {isAdmin && (
                  <button type="button" onClick={() => navigate("/admin")}>
                    <FaTachometerAlt />
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" onClick={() => navigate("/login")}>
                  <FaSignInAlt />
                  <span>Login</span>
                </button>

                <button type="button" onClick={() => navigate("/login?mode=register")}>
                  <FaUserPlus />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

          {nearbyMessage && <div className="nearby-status">{nearbyMessage}</div>}
        </div>

        <div className="home-map-feature">
          <LeafletMapView cafes={cafes} userLocation={userLocation} />

          <button
            className="map-nearby-floating-btn"
            type="button"
            onClick={handleNearby}
            disabled={loadingNearby}
          >
            <FaLocationArrow />
            {isLoggedIn
              ? loadingNearby
                ? "กำลังค้นหา..."
                : "สำรวจใกล้ฉัน"
              : "เข้าสู่ระบบเพื่อสำรวจ"}
          </button>
        </div>
      </section>

      <section className="app-section">
        <div className="section-heading">
          <div>
            <span>
              {isNearbyMode
                ? "Nearby Cafes"
                : isLoggedIn
                ? "Recommended Cafes"
                : "Preview Cafes"}
            </span>
            <h2>
              {isNearbyMode
                ? "คาเฟ่ใกล้คุณ"
                : isLoggedIn
                ? "คาเฟ่ที่แนะนำ"
                : "ตัวอย่างคาเฟ่ที่แนะนำ"}
            </h2>
          </div>

          {isLoggedIn ? (
            <button type="button" onClick={() => loadCafes()}>
              {isNearbyMode ? "กลับไปดูทั้งหมด" : "รีเฟรช"}
            </button>
          ) : (
            <button type="button" onClick={() => navigate("/login")}>
              เข้าสู่ระบบเพื่อใช้งานเต็ม
            </button>
          )}
        </div>

        <div className="responsive-cafe-grid">
          {cafes.map((cafe) => (
            <AppCafeCard cafe={cafe} key={cafe.id} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;