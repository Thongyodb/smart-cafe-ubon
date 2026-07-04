import { useEffect, useState } from "react";
import { FaLocationArrow, FaSearch } from "react-icons/fa";
import CafeCard from "../components/CafeCard";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

function HomePage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCafes = async (keyword?: string) => {
    try {
      setLoading(true);
      setError("");

      const result = await cafeService.getCafes(keyword);

      setCafes(result.data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลคาเฟ่ได้ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCafes();
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadCafes(search);
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

          {loading && <p className="status-text">กำลังโหลดข้อมูลคาเฟ่...</p>}

          {error && <p className="error-text">{error}</p>}

          {!loading && !error && (
            <div className="cafe-grid">
              {cafes.map((cafe) => (
                <CafeCard cafe={cafe} key={cafe.id} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;