import { useEffect, useMemo, useState } from "react";
import {
  FaImage,
  FaSearch,
  FaStar,
  FaSyncAlt,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import {
  adminReviewService,
  type AdminReviewItem,
} from "../../services/adminReviewService";

const API_BASE_URL = "http://localhost:5000";

const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const result = await adminReviewService.getReviews({
        search: search.trim() || undefined,
        rating: rating ? Number(rating) : undefined,
      });

      setReviews(result.data);
    } catch {
      alert("โหลดข้อมูลรีวิวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialReviews = async () => {
      try {
        const result = await adminReviewService.getReviews();

        if (isMounted) {
          setReviews(result.data);
        }
      } catch {
        if (isMounted) {
          alert("โหลดข้อมูลรีวิวไม่สำเร็จ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    const withImages = reviews.filter(
      (review) => (review.images?.length ?? 0) > 0 || review.imageUrl
    ).length;

    const average =
      total > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
        : 0;

    return {
      total,
      withImages,
      average: average.toFixed(1),
    };
  }, [reviews]);

  const getReviewImageUrls = (review: AdminReviewItem) => {
    const imageUrls = review.images?.map((image) => image.imageUrl) ?? [];

    if (imageUrls.length > 0) {
      return imageUrls;
    }

    return review.imageUrl ? [review.imageUrl] : [];
  };

  const handleDeleteReview = async (review: AdminReviewItem) => {
    const confirmed = confirm(
      `ต้องการลบรีวิวของ "${review.user.fullName}" ในร้าน "${review.cafe.name}" ใช่ไหม?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReviewId(review.id);

      await adminReviewService.deleteReview(review.id);

      setReviews((current) =>
        current.filter((item) => item.id !== review.id)
      );

      alert("ลบรีวิวสำเร็จ");
    } catch {
      alert("ลบรีวิวไม่สำเร็จ");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDeleteReviewImage = async (imageId: number) => {
    const confirmed = confirm("ต้องการลบรูปรีวิวนี้ใช่ไหม?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingImageId(imageId);

      await adminReviewService.deleteReviewImage(imageId);

      setReviews((current) =>
        current.map((review) => ({
          ...review,
          images: review.images?.filter((image) => image.id !== imageId) ?? [],
          imageUrl:
            review.images?.some((image) => image.id === imageId) &&
            review.imageUrl
              ? null
              : review.imageUrl,
        }))
      );

      alert("ลบรูปรีวิวสำเร็จ");
    } catch {
      alert("ลบรูปรีวิวไม่สำเร็จ");
    } finally {
      setDeletingImageId(null);
    }
  };

  const formatDate = (dateText: string) => {
    return new Date(dateText).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Review Management</span>
          <h1>จัดการรีวิว</h1>
          <p>ตรวจสอบรีวิวจากผู้ใช้งาน ลบรีวิวหรือรูปภาพที่ไม่เหมาะสม</p>
        </div>

        <div className="admin-review-summary">
          <div>
            <FaStar />
            <strong>{reviewStats.total}</strong>
            <span>รีวิวทั้งหมด</span>
          </div>

          <div>
            <FaImage />
            <strong>{reviewStats.withImages}</strong>
            <span>มีรูปภาพ</span>
          </div>

          <div>
            <FaStar />
            <strong>{reviewStats.average}</strong>
            <span>คะแนนเฉลี่ย</span>
          </div>
        </div>
      </div>

      <div className="admin-section-card admin-review-filter-card">
        <div className="admin-search-box">
          <FaSearch />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้ / คาเฟ่ / ข้อความรีวิว..."
          />
        </div>

        <select
          className="admin-filter-select"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          <option value="">ทุกคะแนน</option>
          <option value="5">5 ดาว</option>
          <option value="4">4 ดาว</option>
          <option value="3">3 ดาว</option>
          <option value="2">2 ดาว</option>
          <option value="1">1 ดาว</option>
        </select>

        <button className="admin-primary-btn" type="button" onClick={loadReviews}>
          <FaSearch />
          ค้นหา
        </button>

        <button
          className="admin-secondary-btn"
          type="button"
          onClick={() => {
            setSearch("");
            setRating("");
            void loadReviews();
          }}
        >
          <FaSyncAlt />
          โหลดใหม่
        </button>
      </div>

      {loading && <p className="status-text">กำลังโหลดรีวิว...</p>}

      {!loading && reviews.length === 0 && (
        <div className="admin-section-card admin-empty-row">
          ไม่พบข้อมูลรีวิว
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="admin-review-list">
          {reviews.map((review) => {
            const imageUrls = getReviewImageUrls(review);
            const userAvatarUrl = getImageUrl(review.user.avatarUrl);

            return (
              <article className="admin-review-card" key={review.id}>
                <div className="admin-review-card-header">
                  <div className="admin-review-user">
                    <div className="admin-review-avatar admin-review-avatar-crop">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt={review.user.fullName}
                          style={{
                            objectPosition: `${review.user.avatarFocusX ?? 50}% ${
                              review.user.avatarFocusY ?? 50
                            }%`,
                            transform: `scale(${review.user.avatarZoom ?? 1})`,
                            transformOrigin: `${
                              review.user.avatarFocusX ?? 50
                            }% ${review.user.avatarFocusY ?? 50}%`,
                          }}
                        />
                      ) : (
                        <FaUser />
                      )}
                    </div>

                    <div>
                      <h3>{review.user.fullName}</h3>
                      <p>
                        @{review.user.username ?? "-"} ·{" "}
                        {review.user.email ?? "ไม่มีอีเมล"}
                      </p>
                    </div>
                  </div>

                  <button
                    className="admin-danger-btn"
                    type="button"
                    disabled={deletingReviewId === review.id}
                    onClick={() => handleDeleteReview(review)}
                  >
                    <FaTrash />
                    {deletingReviewId === review.id ? "กำลังลบ..." : "ลบรีวิว"}
                  </button>
                </div>

                <div className="admin-review-cafe-box">
                  <div>
                    <span>คาเฟ่</span>
                    <strong>{review.cafe.name}</strong>
                    <small>{review.cafe.district.name}</small>
                  </div>

                  <div className="admin-review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={review.rating >= star ? "active" : ""}
                      />
                    ))}
                  </div>
                </div>

                <p className="admin-review-comment">
                  {review.comment || "ไม่มีข้อความรีวิว"}
                </p>

                <small className="admin-muted-block">
                  วันที่รีวิว: {formatDate(review.createdAt)}
                </small>

                {imageUrls.length > 0 ? (
                  <div className="admin-review-image-grid">
                    {review.images && review.images.length > 0
                      ? review.images.map((image) => {
                          const reviewImageUrl = getImageUrl(image.imageUrl);

                          return (
                            <div
                              className="admin-review-image-item"
                              key={image.id}
                            >
                              <img src={reviewImageUrl} alt="review" />

                              <button
                                type="button"
                                disabled={deletingImageId === image.id}
                                onClick={() =>
                                  handleDeleteReviewImage(image.id)
                                }
                                aria-label="ลบรูปรีวิว"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          );
                        })
                      : imageUrls.map((imageUrl) => {
                          const reviewImageUrl = getImageUrl(imageUrl);

                          return (
                            <div
                              className="admin-review-image-item"
                              key={imageUrl}
                            >
                              <img src={reviewImageUrl} alt="review" />
                            </div>
                          );
                        })}
                  </div>
                ) : (
                  <div className="admin-review-no-image">
                    ไม่มีรูปภาพรีวิว
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminReviewsPage;