import { useEffect, useMemo, useState } from "react";
import {
  FaCamera,
  FaChevronDown,
  FaLocationArrow,
  FaSearch,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import LeafletMapView from "../components/app/LeafletMapView";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

function ExplorePage() {
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [isTopMode, setIsTopMode] = useState(false);
  const [nearbyMessage, setNearbyMessage] = useState("");
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const availableTags = useMemo(() => {
    const tagMap = new Map<number, string>();

    allCafes.forEach((cafe) => {
      cafe.cafeTags?.forEach((cafeTag) => {
        const tag = cafeTag.tag;

        if (tag?.id && tag?.name) {
          tagMap.set(tag.id, tag.name);
        }
      });
    });

    return Array.from(tagMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [allCafes]);

  const loadCafes = async (options?: {
    keyword?: string;
    tagId?: string;
    resetNearby?: boolean;
  }) => {
    const keyword = options?.keyword ?? search;
    const tagId = options?.tagId ?? selectedTagId;

    const result = await cafeService.getCafes({
      search: keyword.trim() || undefined,
      tagIds: tagId ? [Number(tagId)] : [],
    });

    setCafes(result.data);
    setSelectedCafe(null);
    setIsTopMode(false);

    if (options?.resetNearby !== false) {
      setIsNearbyMode(false);
      setNearbyMessage("");
      setUserLocation(null);
    }
  };

  const handleSelectCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

  const handleStyleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextTagId = event.target.value;
    setSelectedTagId(nextTagId);

    try {
      await loadCafes({
        keyword: search,
        tagId: nextTagId,
      });
    } catch {
      setCafes([]);
    }
  };

  const handleTop10 = () => {
    const topCafes = [...allCafes]
      .sort((firstCafe, secondCafe) => {
        const firstRating = Number(firstCafe.averageRating ?? 0);
        const secondRating = Number(secondCafe.averageRating ?? 0);

        return secondRating - firstRating;
      })
      .slice(0, 10);

    setCafes(topCafes);
    setSelectedCafe(null);
    setSelectedTagId("");
    setIsNearbyMode(false);
    setIsTopMode(true);
    setNearbyMessage("แสดง 10 คาเฟ่ที่มีคะแนนสูงที่สุด");
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

          const result = await cafeService.getNearbyCafes(lat, lng, 5);

          setCafes(result.data);
          setSelectedCafe(null);
          setSelectedTagId("");
          setIsNearbyMode(true);
          setIsTopMode(false);
          setNearbyMessage(`พบคาเฟ่ใกล้คุณ ${result.count} ร้าน ภายใน 5 km`);
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
      .getCafes({ search: "" })
      .then((result) => {
        if (isMounted) {
          setAllCafes(result.data);
          setCafes(result.data);
          setSelectedCafe(null);
          setIsNearbyMode(false);
          setIsTopMode(false);
          setNearbyMessage("");
          setUserLocation(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllCafes([]);
          setCafes([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-page explore-page">
      <div className="explore-map-background">
        <LeafletMapView
          cafes={cafes}
          userLocation={userLocation}
          selectedCafeId={selectedCafe?.id}
        />
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
              {isNearbyMode ? "Nearby Map" : isTopMode ? "Top Rated" : "Explore Map"}
            </span>

            <h1>
              {isNearbyMode
                ? "คาเฟ่ใกล้คุณ"
                : isTopMode
                ? "Top 10"
                : "สำรวจคาเฟ่"}
            </h1>
          </div>

          <button className="round-icon-btn" type="button" onClick={() => loadCafes()}>
            <FaTimes />
          </button>
        </div>

        <form
          className="app-search explore-search-form"
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

        <div className="explore-filter-row">
          <div className="explore-style-select">
            <FaCamera />

            <select value={selectedTagId} onChange={handleStyleChange}>
              <option value="">Select Style</option>

              {availableTags.map((tag) => (
                <option value={tag.id} key={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <FaChevronDown />
          </div>

          <button
            className={`explore-top10-btn ${isTopMode ? "active" : ""}`}
            type="button"
            onClick={handleTop10}
          >
            <FaStar />
            Top 10
          </button>
        </div>

        {nearbyMessage && <div className="nearby-status">{nearbyMessage}</div>}

        <h2 className="explore-result-title">
          {isNearbyMode ? "ร้านใกล้คุณ" : isTopMode ? "คาเฟ่คะแนนสูงสุด" : "รายการคาเฟ่"}
        </h2>

        <div className="explore-result-list">
          {cafes.map((cafe) => (
            <AppCafeCard
              cafe={cafe}
              compact
              key={cafe.id}
              onSelect={handleSelectCafe}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default ExplorePage;