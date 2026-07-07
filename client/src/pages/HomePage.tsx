import { useEffect, useState } from "react";
import {
  FaCamera,
  FaHeart,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSearch,
  FaStore,
} from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import MapPreview from "../components/app/MapPreview";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");

  const loadCafes = async () => {
    const result = await cafeService.getCafes({ search });
    setCafes(result.data);
  };

  useEffect(() => {
    loadCafes();
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

          <div className="filter-chips">
            <span>Ubon</span>
            <span>Color Tone: Pastel/Minimal</span>
            <span>Photo Spot</span>
          </div>

          <div className="quick-actions">
            <button type="button">
              <FaStore />
              <span>Explore Cafes</span>
            </button>

            <button type="button">
              <FaHeart />
              <span>Saved Spots</span>
            </button>

            <button type="button">
              <FaMapMarkerAlt />
              <span>Nearby</span>
            </button>

            <button type="button">
              <FaCamera />
              <span>Posing Guide</span>
            </button>
          </div>
        </div>

        <div className="home-map-feature">
          <MapPreview />

          <div className="map-hero-text">
            <h2>Find your perfect shot in Ubon</h2>
            <p>สำรวจคาเฟ่ใกล้ตัวและจุดถ่ายรูปยอดนิยม</p>
            <button type="button">
              <FaLocationArrow /> สำรวจเลย
            </button>
          </div>
        </div>
      </section>

      <section className="app-section">
        <div className="section-heading">
          <div>
            <span>Popular Cafes</span>
            <h2>คาเฟ่ยอดนิยม</h2>
          </div>

          <button type="button">ดูทั้งหมด</button>
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