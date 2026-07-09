import { useEffect, useState } from "react";
import {
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import LeafletMapView from "../components/app/LeafletMapView";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

function ExplorePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [nearbyMessage, setNearbyMessage] = useState("");
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const loadCafes = async () => {
    const result = await cafeService.getCafes({ search });

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
    loadCafes();
  }, []);

  return (
    <main className="app-page explore-page">
      <div className="explore-map-background">
        <LeafletMapView cafes={cafes} userLocation={userLocation} />
      </div>

      <button
        className="map-nearby-floating-btn explore-nearby-btn"
        type="button"
        onClick={handleNearby}
        disabled={loadingNearby}
      >
        <FaLocationArrow />
        {loadingNearby ? "กำลังค้นหา..." : "สำรวจใกล้ฉัน"}
      </button>

      <section className="explore-panel">
        <div className="explore-header">
          <div>
            <span className="eyebrow">
              {isNearbyMode ? "Nearby Map" : "Explore Map"}
            </span>
            <h1>{isNearbyMode ? "คาเฟ่ใกล้คุณ" : "สำรวจคาเฟ่"}</h1>
          </div>

          <button className="round-icon-btn" type="button" onClick={loadCafes}>
            <FaTimes />
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
            placeholder="ค้นหาร้านบนแผนที่..."
          />

          <button type="submit">ค้นหา</button>
        </form>

        <div className="filter-chips">
          <span>
            <FaMapMarkerAlt /> Ubon
          </span>
          <span>Satellite Map</span>
          <span>{cafes.length} Spots</span>
        </div>

        {nearbyMessage && <div className="nearby-status">{nearbyMessage}</div>}

        <h2 className="explore-result-title">
          {isNearbyMode ? "ร้านใกล้คุณ" : "รายการคาเฟ่"}
        </h2>

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