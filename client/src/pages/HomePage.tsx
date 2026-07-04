import { useEffect, useMemo, useState } from "react";
import { FaFilter, FaLocationArrow, FaSearch, FaTimes } from "react-icons/fa";
import CafeCard from "../components/CafeCard";
import { cafeService } from "../services/cafeService";
import { metaService, type FilterData } from "../services/metaService";
import type { Cafe } from "../types/cafe";

function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filters, setFilters] = useState<FilterData>({
    categories: [],
    districts: [],
    tags: [],
  });

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const groupedTags = useMemo(() => {
    return {
      STYLE: filters.tags.filter((tag) => tag.type === "STYLE"),
      COLOR: filters.tags.filter((tag) => tag.type === "COLOR"),
      VIEW: filters.tags.filter((tag) => tag.type === "VIEW"),
      TIME: filters.tags.filter((tag) => tag.type === "TIME"),
      FEATURE: filters.tags.filter((tag) => tag.type === "FEATURE"),
    };
  }, [filters.tags]);

  const loadCafes = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await cafeService.getCafes({
        search,
        categoryId,
        districtId,
        tagIds: selectedTagIds,
      });

      setCafes(result.data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลคาเฟ่ได้ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่");
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const result = await metaService.getFilters();
      setFilters(result.data);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  useEffect(() => {
    loadFilters();
    loadCafes();
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadCafes();
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((current) => {
      if (current.includes(tagId)) {
        return current.filter((id) => id !== tagId);
      }

      return [...current, tagId];
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setDistrictId(undefined);
    setSelectedTagIds([]);

    setTimeout(() => {
      loadCafes();
    }, 0);
  };

  const applyFilters = () => {
    loadCafes();
  };

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-text">
            <span className="hero-badge">Smart Cafe Ubon</span>

            <h1>
              ค้นหาคาเฟ่และ
              <br />
              จุดถ่ายรูปในอุบลราชธานี
            </h1>

            <p>
              ระบบแนะนำคาเฟ่ตามสไตล์ สีร้าน วิว ช่วงเวลา และตำแหน่งปัจจุบัน
              เพื่อให้คุณเจอคาเฟ่ที่ใช่สำหรับการถ่ายรูป
            </p>

            <form className="search-box" onSubmit={handleSearch}>
              <FaSearch />
              <input
                type="text"
                placeholder="ค้นหาชื่อคาเฟ่ สไตล์ หรืออำเภอ..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">ค้นหา</button>
            </form>

            <button className="nearby-btn" type="button">
              <FaLocationArrow />
              ค้นหาร้านใกล้ฉัน
            </button>
          </div>

          <div className="hero-card">
            <h2>AI Recommendation</h2>
            <p>Minimal • Garden • White Tone • River View</p>
            <div className="score-box">
              <span>Match Score</span>
              <strong>95%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="cafe-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-subtitle">Recommended Cafe</span>
              <h2>คาเฟ่แนะนำในจังหวัดอุบลราชธานี</h2>
            </div>

            <p>{cafes.length} ร้าน</p>
          </div>

          <div className="filter-panel">
            <div className="filter-title">
              <FaFilter />
              <h3>ตัวกรองการค้นหา</h3>
            </div>

            <div className="filter-row">
              <div className="filter-field">
                <label>ประเภท</label>
                <select
                  value={categoryId ?? ""}
                  onChange={(event) =>
                    setCategoryId(event.target.value ? Number(event.target.value) : undefined)
                  }
                >
                  <option value="">ทั้งหมด</option>
                  {filters.categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>อำเภอ</label>
                <select
                  value={districtId ?? ""}
                  onChange={(event) =>
                    setDistrictId(event.target.value ? Number(event.target.value) : undefined)
                  }
                >
                  <option value="">ทั้งหมด</option>
                  {filters.districts.map((district) => (
                    <option value={district.id} key={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <h4>สไตล์ร้าน</h4>
              <div className="filter-tags">
                {groupedTags.STYLE.map((tag) => (
                  <button
                    type="button"
                    className={selectedTagIds.includes(tag.id) ? "filter-chip active" : "filter-chip"}
                    onClick={() => toggleTag(tag.id)}
                    key={tag.id}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>โทนสี</h4>
              <div className="filter-tags">
                {groupedTags.COLOR.map((tag) => (
                  <button
                    type="button"
                    className={selectedTagIds.includes(tag.id) ? "filter-chip active" : "filter-chip"}
                    onClick={() => toggleTag(tag.id)}
                    key={tag.id}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>วิว / บรรยากาศ</h4>
              <div className="filter-tags">
                {groupedTags.VIEW.map((tag) => (
                  <button
                    type="button"
                    className={selectedTagIds.includes(tag.id) ? "filter-chip active" : "filter-chip"}
                    onClick={() => toggleTag(tag.id)}
                    key={tag.id}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>ช่วงเวลาที่เหมาะกับการถ่ายรูป</h4>
              <div className="filter-tags">
                {groupedTags.TIME.map((tag) => (
                  <button
                    type="button"
                    className={selectedTagIds.includes(tag.id) ? "filter-chip active" : "filter-chip"}
                    onClick={() => toggleTag(tag.id)}
                    key={tag.id}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="filter-apply-btn" type="button" onClick={applyFilters}>
                ใช้ตัวกรอง
              </button>

              <button className="filter-clear-btn" type="button" onClick={clearFilters}>
                <FaTimes />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          {loading && <p className="status-text">กำลังโหลดข้อมูลคาเฟ่...</p>}

          {error && <p className="error-text">{error}</p>}

          {!loading && !error && (
            <div className="cafe-grid">
              {cafes.map((cafe) => (
                <CafeCard cafe={cafe} key={cafe.id} />
              ))}
            </div>
          )}

          {!loading && !error && cafes.length === 0 && (
            <p className="status-text">ไม่พบคาเฟ่ที่ตรงกับตัวกรอง</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;