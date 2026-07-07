import { useEffect, useState } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import MapPreview from "../components/app/MapPreview";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

function ExplorePage() {
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
    <main className="app-page explore-page">
      <div className="explore-map-background">
        <MapPreview />
      </div>

      <section className="explore-panel">
        <div className="explore-header">
          <div>
            <span className="eyebrow">Explore Map</span>
            <h1>ค้นหาและกรอง</h1>
          </div>

          <button type="button" className="round-icon-btn">
            <FaFilter />
          </button>
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
          <span>Home</span>
          <span>Pastel/Minimal</span>
          <span>Nearby</span>
        </div>

        <h2 className="explore-result-title">ผลลัพธ์การค้นหา</h2>

        <div className="explore-result-list">
          {cafes.map((cafe) => (
            <AppCafeCard cafe={cafe} compact key={cafe.id} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default ExplorePage;