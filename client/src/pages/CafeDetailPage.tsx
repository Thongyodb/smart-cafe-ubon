import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaEye,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
} from "react-icons/fa";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";

function CafeDetailPage() {
  const { id } = useParams();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCafe = async () => {
      try {
        setLoading(true);
        setError("");

        const cafeId = Number(id);

        if (Number.isNaN(cafeId)) {
          setError("รหัสคาเฟ่ไม่ถูกต้อง");
          return;
        }

        const result = await cafeService.getCafeById(cafeId);
        setCafe(result.data);
      } catch (err) {
        setError("ไม่พบข้อมูลคาเฟ่");
      } finally {
        setLoading(false);
      }
    };

    loadCafe();
  }, [id]);

  if (loading) {
    return <p className="status-text detail-status">กำลังโหลดรายละเอียดคาเฟ่...</p>;
  }

  if (error || !cafe) {
    return (
      <div className="detail-status">
        <p className="error-text">{error}</p>
        <Link to="/" className="detail-btn">
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  const tags = cafe.cafeTags?.map((item) => item.tag.name) ?? [];

  return (
    <main className="detail-page">
      <section
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(45, 35, 28, 0.78), rgba(45, 45, 45, 0.72)), url(${cafe.coverImageUrl})`,
        }}
      >
        <div className="container">
          <Link to="/" className="back-link">
            <FaArrowLeft /> กลับหน้าแรก
          </Link>

          <div className="detail-hero-content">
            <span className="hero-badge">{cafe.category.name}</span>
            <h1>{cafe.name}</h1>
            <p>{cafe.description}</p>

            <div className="detail-stats">
              <span>
                <FaStar /> {cafe.averageRating.toFixed(1)}
              </span>
              <span>
                <FaEye /> {cafe.totalViews} views
              </span>
              <span>
                <FaMapMarkerAlt /> {cafe.district.name}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-content-section">
        <div className="container detail-grid">
          <div className="detail-main-card">
            <h2>ข้อมูลร้าน</h2>

            <div className="info-list">
              <div>
                <FaMapMarkerAlt />
                <span>{cafe.address}</span>
              </div>

              <div>
                <FaClock />
                <span>
                  เปิด {cafe.openTime} - {cafe.closeTime}
                </span>
              </div>

              <div>
                <FaPhoneAlt />
                <span>{cafe.phone ?? "ไม่มีข้อมูลเบอร์โทร"}</span>
              </div>
            </div>

            <div className="tag-list detail-tags">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="price-box">
              ราคาโดยประมาณ: ฿{cafe.priceMin ?? "-"} - ฿{cafe.priceMax ?? "-"}
            </div>
          </div>

          <div className="detail-side-card">
            <h3>คะแนนความนิยม</h3>
            <strong>{cafe.averageRating.toFixed(1)}</strong>
            <p>จาก {cafe.totalReviews} รีวิว</p>
          </div>
        </div>

        <div className="container">
          <div className="photo-spot-section">
            <div className="section-header">
              <div>
                <span className="section-subtitle">Photo Spots</span>
                <h2>มุมถ่ายรูปแนะนำ</h2>
              </div>
            </div>

            <div className="spot-grid">
              {cafe.photoSpots?.map((spot) => (
                <div className="spot-card" key={spot.id}>
                  <h3>{spot.name}</h3>
                  <p>{spot.description}</p>
                  <span>เวลาที่แนะนำ: {spot.bestTime ?? "-"}</span>
                  <small>มุมกล้อง: {spot.cameraAngle ?? "-"}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CafeDetailPage;