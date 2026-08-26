import { useEffect, useMemo, useState } from "react";
import {
  FaCamera,
  FaCoffee,
  FaEye,
  FaImage,
  FaStar,
  FaSyncAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import {
  adminDashboardService,
  type AdminDashboardStats,
  type DashboardReview,
} from "../../services/adminDashboardService";
import { getCafeImageUrl, getImageUrl } from "../../utils/imageUrl";

type UserAvatarFocus = {
  avatarUrl?: string | null;
  avatarFocusX?: number | null;
  avatarFocusY?: number | null;
  avatarZoom?: number | null;
};

function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    const result = await adminDashboardService.getStats();
    return result.data;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
    } catch {
      alert("โหลดข้อมูล Dashboard ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialDashboard = async () => {
      try {
        const dashboardStats = await fetchDashboardStats();

        if (isMounted) {
          setStats(dashboardStats);
        }
      } catch {
        if (isMounted) {
          alert("โหลดข้อมูล Dashboard ไม่สำเร็จ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestReviewStats = useMemo(() => {
    if (!stats) {
      return {
        latestAverage: "0.0",
        latestWithImages: 0,
      };
    }

    const latestReviews = stats.latestReviews ?? [];

    const latestAverage =
      latestReviews.length > 0
        ? latestReviews.reduce((sum, review) => sum + review.rating, 0) /
          latestReviews.length
        : 0;

    const latestWithImages = latestReviews.filter((review) => {
      return (review.images?.length ?? 0) > 0 || review.imageUrl;
    }).length;

    return {
      latestAverage: latestAverage.toFixed(1),
      latestWithImages,
    };
  }, [stats]);

  const getReviewImageUrls = (review: DashboardReview) => {
    const imageUrls = review.images?.map((image) => image.imageUrl) ?? [];

    if (imageUrls.length > 0) {
      return imageUrls;
    }

    return review.imageUrl ? [review.imageUrl] : [];
  };

  const formatDate = (dateText: string) => {
    return new Date(dateText).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="status-text">กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-page">
        <div className="admin-section-card admin-empty-row">
          ไม่พบข้อมูล Dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Overview</span>
          <h1>แดชบอร์ดผู้ดูแลระบบ</h1>
          <p>ภาพรวมข้อมูลคาเฟ่ สมาชิก รีวิว รูปภาพ และสถิติการเข้าชม</p>
        </div>

        <button
          className="admin-secondary-btn"
          type="button"
          onClick={() => {
            setLoading(true);
            void loadDashboard();
          }}
        >
          <FaSyncAlt />
          รีเฟรชข้อมูล
        </button>
      </div>

      <div className="admin-dashboard-stats-grid">
        <div className="admin-dashboard-stat-card">
          <FaCoffee />
          <span>คาเฟ่ทั้งหมด</span>
          <strong>{stats.totalCafes}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaUsers />
          <span>สมาชิกทั้งหมด</span>
          <strong>{stats.totalUsers}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaCamera />
          <span>จุดถ่ายรูป</span>
          <strong>{stats.totalPhotoSpots}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaStar />
          <span>รีวิวทั้งหมด</span>
          <strong>{stats.totalReviews}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaImage />
          <span>รีวิวที่มีรูป</span>
          <strong>{stats.reviewsWithImages}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaStar />
          <span>คะแนนรีวิวเฉลี่ย</span>
          <strong>{stats.averageReviewRating.toFixed(1)}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaEye />
          <span>ยอดเข้าชมรวม</span>
          <strong>{stats.totalViews}</strong>
        </div>

        <div className="admin-dashboard-stat-card">
          <FaImage />
          <span>รีวิวล่าสุดมีรูป</span>
          <strong>{latestReviewStats.latestWithImages}</strong>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-section-card">
          <div className="admin-section-title-row">
            <div>
              <span className="admin-eyebrow">Latest Reviews</span>
              <h2>รีวิวล่าสุด</h2>
              <p>คะแนนเฉลี่ยรีวิวล่าสุด {latestReviewStats.latestAverage}</p>
            </div>
          </div>

          <div className="admin-dashboard-review-list">
            {stats.latestReviews.length === 0 && (
              <div className="admin-empty-row">ยังไม่มีรีวิว</div>
            )}

            {stats.latestReviews.map((review) => {
              const imageUrls = getReviewImageUrls(review);

              const reviewUser = review.user as typeof review.user &
                UserAvatarFocus;

              const userAvatarUrl = getImageUrl(reviewUser.avatarUrl);

              return (
                <article className="admin-dashboard-review-item" key={review.id}>
                  <div className="admin-dashboard-review-header">
                    <div className="admin-dashboard-review-user">
                      <div className="admin-dashboard-avatar admin-dashboard-avatar-crop">
                        {userAvatarUrl ? (
                          <img
                            src={userAvatarUrl}
                            alt={reviewUser.fullName}
                            style={{
                              objectPosition: `${reviewUser.avatarFocusX ?? 50}% ${
                                reviewUser.avatarFocusY ?? 50
                              }%`,
                              transform: `scale(${reviewUser.avatarZoom ?? 1})`,
                              transformOrigin: `${
                                reviewUser.avatarFocusX ?? 50
                              }% ${reviewUser.avatarFocusY ?? 50}%`,
                            }}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>

                      <div>
                        <h3>{reviewUser.fullName}</h3>

                        <p>
                          {review.cafe.name} · {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="admin-dashboard-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={review.rating >= star ? "active" : ""}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="admin-dashboard-review-comment">
                    {review.comment || "ไม่มีข้อความรีวิว"}
                  </p>

                  {imageUrls.length > 0 && (
                    <div className="admin-dashboard-review-images">
                      {imageUrls.slice(0, 5).map((imageUrl) => (
                        <img
                          src={getImageUrl(imageUrl)}
                          alt="review"
                          key={imageUrl}
                        />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="admin-section-card">
          <div className="admin-section-title-row">
            <div>
              <span className="admin-eyebrow">Popular Cafes</span>
              <h2>คาเฟ่ยอดเข้าชมสูงสุด</h2>
              <p>เรียงจากยอดเข้าชมมากไปน้อย</p>
            </div>
          </div>

          <div className="admin-dashboard-cafe-list">
            {stats.popularCafes.length === 0 && (
              <div className="admin-empty-row">ยังไม่มีข้อมูลคาเฟ่</div>
            )}

            {stats.popularCafes.map((cafe) => (
              <article className="admin-dashboard-cafe-item" key={cafe.id}>
                <img
                  src={getCafeImageUrl(cafe.coverImageUrl)}
                  alt={cafe.name}
                />

                <div>
                  <h3>{cafe.name}</h3>

                  <p>
                    {cafe.district.name} · {cafe.category.name}
                  </p>
                </div>

                <strong>
                  <FaEye />
                  {cafe.totalViews}
                </strong>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-section-card">
        <div className="admin-section-title-row">
          <div>
            <span className="admin-eyebrow">Latest Cafes</span>
            <h2>คาเฟ่ล่าสุดในระบบ</h2>
            <p>คาเฟ่ที่ถูกเพิ่มเข้าระบบล่าสุด</p>
          </div>
        </div>

        <div className="admin-dashboard-latest-cafes">
          {stats.latestCafes.length === 0 && (
            <div className="admin-empty-row">ยังไม่มีข้อมูลคาเฟ่</div>
          )}

          {stats.latestCafes.map((cafe) => (
            <article className="admin-dashboard-latest-cafe" key={cafe.id}>
              <img src={getCafeImageUrl(cafe.coverImageUrl)} alt={cafe.name} />

              <div>
                <h3>{cafe.name}</h3>

                <p>
                  {cafe.district.name} · {cafe.category.name}
                </p>
              </div>

              <div className="admin-dashboard-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={cafe.averageRating >= star ? "active" : ""}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;