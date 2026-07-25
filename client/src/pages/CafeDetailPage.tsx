import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaClock,
  FaEdit,
  FaEye,
  FaImage,
  FaImages,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSave,
  FaStar,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { cafeService } from "../services/cafeService";
import { reviewService, type ReviewItem } from "../services/reviewService";
import type { Cafe } from "../types/cafe";
import { authStorage } from "../utils/authStorage";

const MAX_REVIEW_IMAGES = 5;

function CafeDetailPage() {
  const { id } = useParams();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([]);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [savingReview, setSavingReview] = useState(false);

  const currentUser = authStorage.getUser();

  useEffect(() => {
    let isMounted = true;

    const loadCafe = async () => {
      try {
        setError("");

        const cafeId = Number(id);

        if (Number.isNaN(cafeId)) {
          setError("รหัสคาเฟ่ไม่ถูกต้อง");
          return;
        }

        const [cafeResult, reviewResult] = await Promise.all([
          cafeService.getCafeById(cafeId),
          reviewService.getCafeReviews(cafeId),
        ]);

        if (isMounted) {
          setCafe(cafeResult.data);
          setReviews(reviewResult.data);
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

    void loadCafe();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const clearReviewImages = () => {
    reviewImagePreviews.forEach((previewUrl) => {
      URL.revokeObjectURL(previewUrl);
    });

    setReviewImages([]);
    setReviewImagePreviews([]);
  };

  const resetReviewForm = () => {
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewComment("");
    clearReviewImages();
  };

  const reloadCafeAndReviews = async () => {
    if (!cafe) {
      return;
    }

    const [cafeResult, reviewResult] = await Promise.all([
      cafeService.getCafeById(cafe.id),
      reviewService.getCafeReviews(cafe.id),
    ]);

    setCafe(cafeResult.data);
    setReviews(reviewResult.data);
  };

  const myReview = currentUser
    ? reviews.find((review) => review.userId === currentUser.id)
    : undefined;

  const editingReview = editingReviewId
    ? reviews.find((review) => review.id === editingReviewId)
    : undefined;

  const existingReviewImages = editingReview?.images ?? [];

  const remainingReviewImageSlots = editingReviewId
    ? Math.max(MAX_REVIEW_IMAGES - existingReviewImages.length, 0)
    : MAX_REVIEW_IMAGES;

  const handleReviewImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (selectedFiles.length !== imageFiles.length) {
      alert("เลือกได้เฉพาะไฟล์รูปภาพเท่านั้น");
    }

    if (remainingReviewImageSlots <= 0) {
      alert("รีวิวนี้มีรูปครบ 5 รูปแล้ว กรุณาลบรูปเก่าก่อนเพิ่มรูปใหม่");
      event.target.value = "";
      return;
    }

    const uniqueImageFiles = imageFiles.filter((file, index, array) => {
      return (
        index ===
        array.findIndex(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        )
      );
    });

    if (uniqueImageFiles.length !== imageFiles.length) {
      alert("มีรูปซ้ำในชุดที่เลือก ระบบจะใช้เฉพาะรูปที่ไม่ซ้ำ");
    }

    if (uniqueImageFiles.length > remainingReviewImageSlots) {
      alert(`เพิ่มรูปได้อีก ${remainingReviewImageSlots} รูปเท่านั้น`);
    }

    const limitedFiles = uniqueImageFiles.slice(0, remainingReviewImageSlots);

    clearReviewImages();

    setReviewImages(limitedFiles);
    setReviewImagePreviews(
      limitedFiles.map((file) => URL.createObjectURL(file))
    );

    event.target.value = "";
  };

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cafe) {
      return;
    }

    if (!authStorage.isLoggedIn()) {
      alert("กรุณาเข้าสู่ระบบก่อนรีวิว");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      alert("กรุณาเลือกคะแนน 1-5 ดาว");
      return;
    }

    if (reviewImages.length > remainingReviewImageSlots) {
      alert(`เพิ่มรูปได้อีก ${remainingReviewImageSlots} รูปเท่านั้น`);
      return;
    }

    try {
      setSavingReview(true);

      if (editingReviewId) {
        await reviewService.updateReview(editingReviewId, {
          rating: reviewRating,
          comment: reviewComment,
          images: reviewImages,
        });

        alert("แก้ไขรีวิวสำเร็จ");
      } else {
        await reviewService.createReview(cafe.id, {
          rating: reviewRating,
          comment: reviewComment,
          images: reviewImages,
        });

        alert("เพิ่มรีวิวสำเร็จ");
      }

      resetReviewForm();
      await reloadCafeAndReviews();
    } catch {
      alert("บันทึกรีวิวไม่สำเร็จ อาจเป็นเพราะรูปเกิน 5 รูป หรือคุณเคยรีวิวร้านนี้แล้ว");
    } finally {
      setSavingReview(false);
    }
  };

  const handleEditReview = (review: ReviewItem) => {
    clearReviewImages();
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment ?? "");
  };

  const handleDeleteReview = async (reviewId: number) => {
    const confirmed = confirm("ต้องการลบรีวิวนี้ใช่ไหม?");

    if (!confirmed) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      await reloadCafeAndReviews();
      resetReviewForm();

      alert("ลบรีวิวสำเร็จ");
    } catch {
      alert("ลบรีวิวไม่สำเร็จ");
    }
  };

  const handleDeleteExistingReviewImage = async (imageId: number) => {
    const confirmed = confirm("ต้องการลบรูปรีวิวนี้ใช่ไหม?");

    if (!confirmed) {
      return;
    }

    try {
      await reviewService.deleteReviewImage(imageId);
      await reloadCafeAndReviews();
      clearReviewImages();

      alert("ลบรูปรีวิวสำเร็จ");
    } catch {
      alert("ลบรูปรีวิวไม่สำเร็จ");
    }
  };

  const formatDate = (dateText: string) => {
    return new Date(dateText).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getReviewImageUrls = (review: ReviewItem) => {
    const imageUrls = review.images?.map((image) => image.imageUrl) ?? [];

    if (imageUrls.length > 0) {
      return imageUrls;
    }

    return review.imageUrl ? [review.imageUrl] : [];
  };

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
  const showReviewForm = Boolean(currentUser && (!myReview || editingReviewId));

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

        <div className="container">
          <section className="review-section">
            <div className="section-header">
              <div>
                <span className="section-subtitle">Reviews</span>
                <h2>รีวิวจากผู้ใช้งาน</h2>
                <p className="section-description">
                  คะแนนเฉลี่ย {cafe.averageRating.toFixed(1)} จาก{" "}
                  {cafe.totalReviews} รีวิว
                </p>
              </div>
            </div>

            {!currentUser && (
              <div className="review-login-card">
                <h3>เข้าสู่ระบบเพื่อเขียนรีวิว</h3>
                <p>สมาชิกสามารถให้คะแนน เขียนรีวิว และเพิ่มรูปภาพได้</p>
                <Link to="/login" className="detail-btn">
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}

            {currentUser && myReview && !editingReviewId && (
              <div className="my-review-card">
                <div>
                  <span className="section-subtitle">Your Review</span>
                  <h3>คุณรีวิวร้านนี้แล้ว</h3>
                  <p>สามารถแก้ไขรีวิว หรือเพิ่มรูปภาพรีวิวของตัวเองได้</p>
                </div>

                <div className="review-action-row">
                  <button
                    className="review-secondary-btn"
                    type="button"
                    onClick={() => handleEditReview(myReview)}
                  >
                    <FaEdit />
                    แก้ไข/เพิ่มรูป
                  </button>

                  <button
                    className="review-danger-btn"
                    type="button"
                    onClick={() => handleDeleteReview(myReview.id)}
                  >
                    <FaTrash />
                    ลบรีวิว
                  </button>
                </div>
              </div>
            )}

            {showReviewForm && (
              <form className="review-form-card" onSubmit={handleSubmitReview}>
                <div className="admin-form-title">
                  <div>
                    <h3>
                      {editingReviewId ? "แก้ไขรีวิวของคุณ" : "เขียนรีวิว"}
                    </h3>
                    <p>
                      1 รีวิวเพิ่มรูปได้สูงสุด {MAX_REVIEW_IMAGES} รูปรวมทั้งหมด
                    </p>
                  </div>

                  {editingReviewId && (
                    <button
                      className="review-secondary-btn"
                      type="button"
                      onClick={resetReviewForm}
                    >
                      <FaTimes />
                      ยกเลิก
                    </button>
                  )}
                </div>

                <div className="review-stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      className={
                        reviewRating >= star
                          ? "review-star-btn active"
                          : "review-star-btn"
                      }
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="เขียนรีวิว เช่น ร้านสวย บรรยากาศดี เหมาะกับการถ่ายรูป"
                  rows={4}
                />

                {editingReviewId && existingReviewImages.length > 0 && (
                  <div className="existing-review-images-box">
                    <div className="existing-review-images-header">
                      <strong>
                        รูปภาพรีวิวเดิม {existingReviewImages.length}/
                        {MAX_REVIEW_IMAGES}
                      </strong>
                      <span>กด X เพื่อลบรูปที่ไม่ต้องการ</span>
                    </div>

                    <div className="existing-review-image-grid">
                      {existingReviewImages.map((image) => (
                        <div
                          className="existing-review-image-item"
                          key={image.id}
                        >
                          <img src={image.imageUrl} alt="review" />

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteExistingReviewImage(image.id)
                            }
                            aria-label="ลบรูปรีวิว"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label
                  className={
                    remainingReviewImageSlots <= 0
                      ? "review-upload-box disabled"
                      : "review-upload-box"
                  }
                >
                  <FaImages />
                  <div>
                    <strong>
                      {editingReviewId
                        ? "เพิ่มรูปภาพรีวิว"
                        : "เลือกรูปภาพรีวิว"}
                    </strong>

                    <span>
                      {remainingReviewImageSlots > 0
                        ? `เพิ่มได้อีก ${remainingReviewImageSlots} รูป จากทั้งหมด ${MAX_REVIEW_IMAGES} รูป`
                        : `รูปครบ ${MAX_REVIEW_IMAGES} รูปแล้ว กรุณาลบรูปเก่าก่อนเพิ่มรูปใหม่`}
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={remainingReviewImageSlots <= 0}
                    onChange={handleReviewImageChange}
                  />
                </label>

                {reviewImagePreviews.length > 0 && (
                  <div className="review-preview-grid">
                    {reviewImagePreviews.map((previewUrl) => (
                      <div className="review-preview-item" key={previewUrl}>
                        <img src={previewUrl} alt="preview" />
                      </div>
                    ))}

                    <button
                      className="review-secondary-btn"
                      type="button"
                      onClick={clearReviewImages}
                    >
                      <FaTimes />
                      ล้างรูปที่เลือก
                    </button>
                  </div>
                )}

                <button
                  className="review-submit-btn"
                  type="submit"
                  disabled={savingReview}
                >
                  <FaSave />
                  {savingReview
                    ? "กำลังบันทึก..."
                    : editingReviewId
                    ? "บันทึกการแก้ไข"
                    : "ส่งรีวิว"}
                </button>
              </form>
            )}

            <div className="review-list">
              {reviews.length === 0 && (
                <div className="empty-photo-spots">
                  <FaStar />
                  <h3>ยังไม่มีรีวิว</h3>
                  <p>เป็นคนแรกที่รีวิวคาเฟ่นี้</p>
                </div>
              )}

              {reviews.map((review) => {
                const reviewImageUrls = getReviewImageUrls(review);

                return (
                  <article className="review-card" key={review.id}>
                    <div className="review-user-avatar">
                      {review.user.avatarUrl ? (
                        <img
                          src={review.user.avatarUrl}
                          alt={review.user.fullName}
                        />
                      ) : (
                        <span>
                          {(review.user.fullName || review.user.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="review-card-body">
                      <div className="review-card-header">
                        <div>
                          <h3>{review.user.fullName}</h3>
                          <small>{formatDate(review.createdAt)}</small>
                        </div>

                        <div className="review-stars-display">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={review.rating >= star ? "active" : ""}
                            />
                          ))}
                        </div>
                      </div>

                      <p>{review.comment || "ไม่มีข้อความรีวิว"}</p>

                      {reviewImageUrls.length > 0 && (
                        <div className="review-photo-grid">
                          {reviewImageUrls.map((imageUrl) => (
                            <img src={imageUrl} alt="review" key={imageUrl} />
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default CafeDetailPage;