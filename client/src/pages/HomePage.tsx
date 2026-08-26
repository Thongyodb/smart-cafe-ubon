import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaChevronDown,
  FaChevronRight,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import AppCafeCard from "../components/app/AppCafeCard";
import LeafletMapView from "../components/app/LeafletMapView";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";
import { authStorage } from "../utils/authStorage";
import { getCafeImageUrl } from "../utils/imageUrl";

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80";

const SLIDE_INTERVAL_MS = 5000;
const NEARBY_RADIUS_KM = 5;

type CafeWithCoverFocus = Cafe & {
  coverFocusX?: number | string | null;
  coverFocusY?: number | string | null;
  coverZoom?: number | string | null;
};

const toNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
};

const getCoverFocus = (cafe: CafeWithCoverFocus | null) => {
  return {
    x: toNumber(cafe?.coverFocusX, 50),
    y: toNumber(cafe?.coverFocusY, 50),
    zoom: toNumber(cafe?.coverZoom, 1),
  };
};

function HomePage() {
  const navigate = useNavigate();
  const featureRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = authStorage.isLoggedIn();

  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [nearbyMessage, setNearbyMessage] = useState("");
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const heroCafes = useMemo(() => {
    const cafesWithCover = allCafes.filter((cafe) => cafe.coverImageUrl);

    return cafesWithCover.length > 0 ? cafesWithCover : allCafes;
  }, [allCafes]);

  const activeSlideIndex =
    heroCafes.length > 0 ? currentSlide % heroCafes.length : 0;

  const heroCafe = useMemo(() => {
    if (heroCafes.length === 0) {
      return null;
    }

    return heroCafes[activeSlideIndex];
  }, [heroCafes, activeSlideIndex]);

  const heroTitle = heroCafe?.name || "Cafe Ubon Ratchathani";

  const mapCafes = cafes.length > 0 ? cafes : allCafes;

  const recommendedCafes = useMemo(() => {
    return [...cafes]
      .sort((firstCafe, secondCafe) => {
        const firstRating = Number(firstCafe.averageRating ?? 0);
        const secondRating = Number(secondCafe.averageRating ?? 0);

        return secondRating - firstRating;
      })
      .slice(0, 4);
  }, [cafes]);

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

  const nearbyText = loadingNearby
    ? "กำลังค้นหาร้านใกล้คุณ..."
    : nearbyMessage ||
      `กด Explore Now เพื่อค้นหาร้านใกล้คุณ ภายใน ${NEARBY_RADIUS_KM} km`;

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
      limit: 50,
    });

    setCafes(result.data);

    if (options?.resetNearby !== false) {
      setIsNearbyMode(false);
      setNearbyMessage("");
      setUserLocation(null);
    }
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await loadCafes({
        keyword: search,
        tagId: selectedTagId,
      });
    } catch {
      alert("ค้นหาคาเฟ่ไม่สำเร็จ");
    }
  };

  const handleStyleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextTagId = event.target.value;
    setSelectedTagId(nextTagId);

    try {
      await loadCafes({
        keyword: search,
        tagId: nextTagId,
      });
    } catch {
      alert("กรองสไตล์คาเฟ่ไม่สำเร็จ");
    }
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

    featureRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setLoadingNearby(true);
    setNearbyMessage("กำลังค้นหาร้านใกล้คุณ...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({ lat, lng });

          const result = await cafeService.getNearbyCafes(
            lat,
            lng,
            NEARBY_RADIUS_KM
          );

          setCafes(result.data);
          setIsNearbyMode(true);
          setNearbyMessage(
            `พบคาเฟ่ใกล้คุณ ${result.count} ร้าน ภายใน ${NEARBY_RADIUS_KM} km`
          );
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
        limit: 50,
      })
      .then((result) => {
        if (isMounted) {
          setAllCafes(result.data);
          setCafes(result.data);
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

  useEffect(() => {
    if (heroCafes.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % heroCafes.length);
    }, SLIDE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [heroCafes.length]);

  return (
    <main className="home-redesign">
      <section
        className="home-showcase"
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundImage: "none",
        }}
      >
        <div
          className="home-hero-slide-track"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            transform: `translateX(-${activeSlideIndex * 100}%)`,
            transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          {(heroCafes.length > 0 ? heroCafes : [null]).map(
            (slideCafe, index) => {
              const slideImageUrl = slideCafe?.coverImageUrl
                ? getCafeImageUrl(slideCafe.coverImageUrl)
                : HERO_FALLBACK_IMAGE;

              const slideTitle =
                slideCafe?.name || "Cafe Ubon Ratchathani";

              const slideFocus = getCoverFocus(
                slideCafe as CafeWithCoverFocus | null
              );

              return (
                <div
                  className="home-hero-slide"
                  key={slideCafe?.id ?? `fallback-${index}`}
                  style={{
                    minWidth: "100%",
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={slideImageUrl}
                    alt={slideTitle}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `${slideFocus.x}% ${slideFocus.y}%`,
                      transform: `scale(${slideFocus.zoom})`,
                      transformOrigin: `${slideFocus.x}% ${slideFocus.y}%`,
                      pointerEvents: "none",
                    }}
                  />
                </div>
              );
            }
          )}
        </div>

        <div className="home-showcase-shade" style={{ zIndex: 1 }} />

        <div
          className="home-showcase-inner"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div className="home-showcase-copy">
            <h1>{heroTitle}</h1>

            <div className="home-showcase-description">
              <p>ยินดีต้อนรับ Smart Cafe Ubon เข้าสู่ระบบแนะนำคาเฟ่</p>
              <p>ค้นหาคาเฟ่และจุดถ่ายรูปในอุบลราชธานี</p>
            </div>

            <button
              className="home-explore-now-btn"
              type="button"
              onClick={handleNearby}
              disabled={loadingNearby}
            >
              <FaLocationArrow />
              {loadingNearby ? "Finding..." : "Explore Now"}
            </button>
          </div>

          <div className="home-showcase-map-card">
            <LeafletMapView cafes={mapCafes} userLocation={userLocation} />
          </div>
        </div>

        {heroCafes.length > 1 && (
          <div className="home-slide-dots">
            {heroCafes.map((cafe, index) => (
              <button
                key={cafe.id}
                className={index === activeSlideIndex ? "active" : ""}
                type="button"
                aria-label={`slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="home-feature-wrap" ref={featureRef}>
        <div className="home-feature-card">
          <form className="home-feature-item" onSubmit={handleSearchSubmit}>
            <div className="home-feature-icon">
              <FaSearch />
            </div>

            <div className="home-feature-content">
              <h3>Search for Cafe</h3>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาคาเฟ่อุบล..."
              />
            </div>
          </form>

          <div className="home-feature-divider" />

          <div className="home-feature-item">
            <div className="home-feature-icon">
              <FaCamera />
            </div>

            <div className="home-feature-content">
              <h3>Cafe Style</h3>

              <div className="home-style-select-wrap">
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
            </div>
          </div>

          <div className="home-feature-divider" />

          <button
            className="home-feature-item home-nearby-item"
            type="button"
            onClick={handleNearby}
            disabled={loadingNearby}
          >
            <div className="home-feature-icon">
              <FaMapMarkerAlt />
            </div>

            <div className="home-feature-content">
              <h3>Nearby</h3>
              <p>{nearbyText}</p>
            </div>
          </button>
        </div>
      </section>

      <section className="home-recommended-section">
        <div className="home-section-heading">
          <div>
            <h2>
              {isNearbyMode ? "Nearby Cafes" : "Recommended Cafes"}
              <FaStar />
            </h2>

            <p>
              {isNearbyMode
                ? "คาเฟ่ใกล้ตำแหน่งของคุณ"
                : "คาเฟ่ที่แนะนำในจังหวัดอุบลราชธานี"}
            </p>
          </div>

          <button
            className="home-view-all-btn"
            type="button"
            onClick={() => navigate("/explore")}
          >
            View All
            <FaChevronRight />
          </button>
        </div>

        {recommendedCafes.length > 0 ? (
          <div className="responsive-cafe-grid home-recommended-grid">
            {recommendedCafes.map((cafe) => (
              <AppCafeCard cafe={cafe} key={cafe.id} />
            ))}
          </div>
        ) : (
          <div className="home-empty-card">ไม่พบข้อมูลคาเฟ่ในขณะนี้</div>
        )}
      </section>
    </main>
  );
}

export default HomePage;