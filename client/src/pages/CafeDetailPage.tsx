import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaClock,
  FaEye,
  FaImage,
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
    let isMounted = true;

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

        if (isMounted) {
          setCafe(result.data);
        }
      } catch {
        if (isMounted) {
          setError("ไม่พบข้อมูลคาเฟ่");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCafe();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <p className="status-text detail-status">
        กำลังโหลดรายละเอียดคาเฟ่...
      </p>
    );
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
  const photoSpots = cafe.photoSpots ?? [];
  const coverImageUrl = cafe.coverImageUrl ?? "";

  return (
    <main className="detail-page">
      <section
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(45, 35, 28, 0.78), rgba(45, 45, 45, 0.72)), url(${coverImageUrl})`,
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
                <p className="section-description">
                  รวมมุมถ่ายรูป เวลาแนะนำ และมุมกล้องที่เหมาะกับร้านนี้
                </p>
              </div>
            </div>

            {photoSpots.length > 0 ? (
              <div className="spot-grid">
                {photoSpots.map((spot) => (
                  <article className="spot-card" key={spot.id}>
                    <div className="spot-image">
                      {spot.imageUrl ? (
                        <img src={spot.imageUrl} alt={spot.name} />
                      ) : (
                        <div className="spot-image-placeholder">
                          <FaImage />
                          <span>ไม่มีรูปภาพ</span>
                        </div>
                      )}
                    </div>

                    <div className="spot-content">
                      <span className="spot-badge">
                        <FaCamera />
                        Photo Spot
                      </span>

                      <h3>{spot.name}</h3>
                      <p>{spot.description ?? "ไม่มีรายละเอียดเพิ่มเติม"}</p>

                      <div className="spot-meta">
                        <span>
                          <FaClock />
                          เวลาแนะนำ: {spot.bestTime ?? "-"}
                        </span>

                        <span>
                          <FaCamera />
                          มุมกล้อง: {spot.cameraAngle ?? "-"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-photo-spots">
                <FaImage />
                <h3>ยังไม่มีจุดถ่ายรูปสำหรับร้านนี้</h3>
                <p>สามารถเพิ่มจุดถ่ายรูปได้จากหน้า Admin</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CafeDetailPage;