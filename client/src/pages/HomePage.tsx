import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaHeart,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSearch,
  FaStore,
} from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import CafeFilterBar from "../components/app/CafeFilterBar";
import type { CafeFilterState } from "../components/app/CafeFilterBar";
import LeafletMapView from "../components/app/LeafletMapView";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

const defaultFilters: CafeFilterState = {
  tagIds: [],
};

function HomePage() {
  const navigate = useNavigate();

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
        } catch (error) {
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
    loadCafes(defaultFilters);
  }, []);

  return (
    <main className="app-page home-page">
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="app-header">
            <div>
              <span className="eyebrow">Cafe Ubon Ratchathani</span>
              <h1>ค้นหาคาเฟ่และจุดถ่ายรูปในอุบลราชธานี</h1>
            </div>

            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=cafe"
              alt="profile"
              className="app-avatar"
            />
          </div>

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

          <div className="quick-actions">
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
          </div>

          {nearbyMessage && (
            <div className="nearby-status">{nearbyMessage}</div>
          )}
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
            {loadingNearby ? "กำลังค้นหา..." : "สำรวจใกล้ฉัน"}
          </button>
        </div>
      </section>

      <section className="app-section">
        <div className="section-heading">
          <div>
            <span>{isNearbyMode ? "Nearby Cafes" : "Recommended Cafes"}</span>
            <h2>{isNearbyMode ? "คาเฟ่ใกล้คุณ" : "คาเฟ่ที่แนะนำ"}</h2>
          </div>

          <button type="button" onClick={() => loadCafes()}>
            {isNearbyMode ? "กลับไปดูทั้งหมด" : "รีเฟรช"}
          </button>
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