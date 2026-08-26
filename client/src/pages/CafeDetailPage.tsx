import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaClock,
  FaEdit,
  FaFacebookF,
  FaGlobe,
  FaHeart,
  FaImage,
  FaImages,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegHeart,
  FaSave,
  FaStar,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { cafeService } from "../services/cafeService";
import { favoriteService } from "../services/favoriteService";
import { reviewService, type ReviewItem } from "../services/reviewService";
import type { Cafe } from "../types/cafe";
import { authStorage } from "../utils/authStorage";

const MAX_REVIEW_IMAGES = 5;

type CafeGalleryImage = {
  id?: number;
  imageUrl?: string | null;
};

type FavoriteListItem = {
  id?: number;
  cafeId?: number;
  cafe?: {
    id?: number;
  };
};

type PreviewImage = {
  url: string;
  title: string;
};



const getCafeGalleryImageUrls = (cafe: Cafe | null) => {
  if (!cafe) {
    return [];
  }

  const cafeWithGallery = cafe as Cafe & {
    images?: CafeGalleryImage[];
    cafeImages?: CafeGalleryImage[];
  };

  const galleryUrls = [
    ...(cafeWithGallery.images ?? []).map((image) => image.imageUrl),
    ...(cafeWithGallery.cafeImages ?? []).map((image) => image.imageUrl),
    cafe.coverImageUrl,
  ].filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  return Array.from(new Set(galleryUrls));
};
const normalizeExternalUrl = (url?: string | null) => {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return "";
  }

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

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

const getGoogleMapUrl = (cafe: Cafe) => {
  const hasLatLng =
    Number.isFinite(cafe.latitude) && Number.isFinite(cafe.longitude);

  const query = hasLatLng
    ? `${cafe.latitude},${cafe.longitude}`
    : `${cafe.name} ${cafe.address}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
};

const isCafeInFavorites = (
  favoriteItems: FavoriteListItem[],
  cafeId: number
) => {
  return favoriteItems.some((item) => {
    return (
      item.id === cafeId || item.cafeId === cafeId || item.cafe?.id === cafeId
    );
  });
};
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

  const [activeCafeImageIndex, setActiveCafeImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const currentUser = authStorage.getUser();
  const displayName = currentUser?.fullName || currentUser?.username || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

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

        let matchedFavorite = false;

        if (authStorage.isLoggedIn()) {
          try {
            const favoriteResult = await favoriteService.getFavorites();

            const favoriteItems = Array.isArray(favoriteResult.data)
              ? (favoriteResult.data as FavoriteListItem[])
              : [];

            matchedFavorite = isCafeInFavorites(favoriteItems, cafeId);
          } catch {
            matchedFavorite = false;
          }
        }

        if (isMounted) {
          setCafe(cafeResult.data);
          setReviews(reviewResult.data);
          setIsFavorite(matchedFavorite);
          setActiveCafeImageIndex(0);
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

  useEffect(() => {
    const galleryImageUrls = getCafeGalleryImageUrls(cafe);

    if (galleryImageUrls.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveCafeImageIndex((currentIndex) => currentIndex + 1);
    }, 3500);

    return () => {
      window.clearInterval(timer);
    };
  }, [cafe]);

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage]);

    const openImagePreview = (imageUrl?: string | null, title = "รูปภาพ") => {
    if (!imageUrl) {
      return;
    }

    setPreviewImage({
      url: getImageUrl(imageUrl),
      title,
    });
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

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

  const handleToggleFavorite = async () => {
    if (!cafe) {
      return;
    }

    if (!authStorage.isLoggedIn()) {
      alert("กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด");
      return;
    }

    const nextFavoriteState = !isFavorite;

    try {
      setTogglingFavorite(true);
      setIsFavorite(nextFavoriteState);

      const result = await favoriteService.toggleFavorite(cafe.id);
      const resultData = result as {
        isFavorite?: boolean;
        data?: {
          isFavorite?: boolean;
        };
      };

      if (typeof resultData.isFavorite === "boolean") {
        setIsFavorite(resultData.isFavorite);
      } else if (typeof resultData.data?.isFavorite === "boolean") {
        setIsFavorite(resultData.data.isFavorite);
      }
    } catch {
      setIsFavorite(!nextFavoriteState);
      alert("บันทึกรายการโปรดไม่สำเร็จ");
    } finally {
      setTogglingFavorite(false);
    }
  };

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
      alert(
        "บันทึกรีวิวไม่สำเร็จ อาจเป็นเพราะรูปเกิน 5 รูป หรือคุณเคยรีวิวร้านนี้แล้ว"
      );
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
  const photoSpots = (cafe.photoSpots ?? []).slice(0, 9);
  const coverImageUrl = getImageUrl(cafe.coverImageUrl);
  const coverFocus = getCoverFocus(cafe as CafeWithCoverFocus);
  const galleryImageUrls = getCafeGalleryImageUrls(cafe).map((imageUrl) =>
    getImageUrl(imageUrl)
  );
  const normalizedGalleryIndex =
    galleryImageUrls.length > 0
      ? activeCafeImageIndex % galleryImageUrls.length
      : 0;
  const activeGalleryImageUrl =
    galleryImageUrls[normalizedGalleryIndex] || coverImageUrl;
  const mapUrl = getGoogleMapUrl(cafe);

const facebookUrl = normalizeExternalUrl(cafe.facebookUrl);
const instagramUrl = normalizeExternalUrl(cafe.instagramUrl);
const websiteUrl = normalizeExternalUrl(cafe.websiteUrl);

const socialLinks = [
  {
    label: "Facebook",
    url: facebookUrl,
    icon: <FaFacebookF />,
    className: "facebook",
  },
  {
    label: "Instagram",
    url: instagramUrl,
    icon: <FaInstagram />,
    className: "instagram",
  },
  {
    label: "Website",
    url: websiteUrl,
    icon: <FaGlobe />,
    className: "website",
  },
].filter((item) => Boolean(item.url));

const showReviewForm = Boolean(currentUser && (!myReview || editingReviewId));
  return (
    <main className="detail-page cafe-detail-redesign">
      <header className="cafe-detail-topbar">
        <Link to="/" className="cafe-detail-title-link">
          <FaArrowLeft />
          <span>Cafe Details</span>
        </Link>

        {currentUser && (
  <div className="cafe-detail-user-pill">
    <div className="cafe-detail-user-avatar">
      {currentUser.avatarUrl ? (
        <img
          src={getImageUrl(currentUser.avatarUrl)}
          alt={displayName}
          style={{
            objectPosition: `${currentUser.avatarFocusX ?? 50}% ${
              currentUser.avatarFocusY ?? 50
            }%`,
            transform: `scale(${currentUser.avatarZoom ?? 1})`,
            transformOrigin: `${currentUser.avatarFocusX ?? 50}% ${
              currentUser.avatarFocusY ?? 50
            }%`,
          }}
        />
      ) : (
        <span>{avatarLetter}</span>
      )}
    </div>

    <strong>{displayName}</strong>
  </div>
)}
      </header>

<section
  className="cafe-detail-cover"
  role={coverImageUrl ? "button" : undefined}
  tabIndex={coverImageUrl ? 0 : undefined}
  onClick={() => openImagePreview(coverImageUrl, cafe.name)}
  onKeyDown={(event) => {
    if (
      coverImageUrl &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      openImagePreview(coverImageUrl, cafe.name);
    }
  }}
  style={{
    position: "relative",
    overflow: "hidden",
    backgroundImage: "none",
    backgroundColor: "#f4fafd",
    cursor: coverImageUrl ? "zoom-in" : "default",
  }}
>
  {coverImageUrl && (
    <img
      src={coverImageUrl}
      alt={cafe.name}
      onClick={() => openImagePreview(coverImageUrl, cafe.name)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: `${coverFocus.x}% ${coverFocus.y}%`,
        transform: `scale(${coverFocus.zoom})`,
        transformOrigin: `${coverFocus.x}% ${coverFocus.y}%`,
        transition: "transform 0.25s ease, object-position 0.25s ease",
        cursor: "zoom-in",
        pointerEvents: "none",
      }}
    />
  )}

  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 1,
      background:
        "linear-gradient(180deg, rgba(244, 250, 253, 0.08), rgba(244, 250, 253, 0.86))",
      pointerEvents: "none",
    }}
  />
</section>

      <section className="detail-content-section cafe-detail-content-section">
        <div className="container detail-grid cafe-detail-layout">
          <div className="detail-main-card cafe-detail-info-card">
            <div className="cafe-detail-card-head">
              <div>
                <div className="cafe-detail-rating-inline">
                  <FaStar />
                  <span>{cafe.averageRating.toFixed(1)}</span>
                </div>

                <h1>{cafe.name}</h1>

                <p>
                  {cafe.description || "ไม่มีรายละเอียดเพิ่มเติมสำหรับร้านนี้"}
                </p>
              </div>

              <button
                className={
                  isFavorite
                    ? "cafe-detail-heart-btn active"
                    : "cafe-detail-heart-btn"
                }
                type="button"
                disabled={togglingFavorite}
                onClick={() => void handleToggleFavorite()}
                aria-label={
                  isFavorite ? "ลบออกจากรายการโปรด" : "บันทึกรายการโปรด"
                }
                title={
                  isFavorite ? "ลบออกจากรายการโปรด" : "บันทึกรายการโปรด"
                }
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="cafe-detail-divider" />

            <div className="cafe-detail-info-grid">
              <div className="cafe-detail-info-item">
                <div>
                  <FaClock />
                </div>

                <section>
                  <span>Opening Hours</span>
                  <strong>
                    {cafe.openTime} - {cafe.closeTime}
                  </strong>
                </section>
              </div>

              <div className="cafe-detail-info-item">
                <div>
                  <FaMapMarkerAlt />
                </div>

                <section>
                  <span>Address</span>
                  <strong className="cafe-detail-address">{cafe.address}</strong>
                </section>
              </div>

              <div className="cafe-detail-info-item">
                <div>
                  <FaPhoneAlt />
                </div>

                <section>
                  <span>Contact</span>
                  <strong>{cafe.phone ?? "ไม่มีข้อมูลเบอร์โทร"}</strong>
                </section>
              </div>

              <div className="cafe-detail-info-item">
                <div>
                  <FaImage />
                </div>

                <section>
                  <span>Price Range</span>
                  <strong>
                    {cafe.priceMin ?? "-"}฿ ~ {cafe.priceMax ?? "-"}฿
                  </strong>
                </section>
              </div>
            </div>

                        <div className="tag-list detail-tags cafe-detail-tags">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="cafe-detail-social-box">
                <span className="cafe-detail-social-label">
                </span>

                <div className="cafe-detail-social-links">
                  {socialLinks.map((link) => (
                    <a
                      className={`cafe-detail-social-link ${link.className}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      key={link.label}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          
          
          

          <aside className="detail-sidebar cafe-detail-sidebar">
            <a
              className="detail-map-button"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <FaMapMarkerAlt />
              นำทางไปที่ร้าน
            </a>

            {activeGalleryImageUrl && (
              <div className="detail-gallery-slider">
                <img
                  src={activeGalleryImageUrl}
                  alt={`${cafe.name} gallery`}
                  key={activeGalleryImageUrl}
                  className="clickable-detail-image"
                  onClick={() =>
                    openImagePreview(activeGalleryImageUrl, `${cafe.name} gallery`)
                  }
                />

                {galleryImageUrls.length > 1 && (
                  <div className="detail-gallery-dots">
                    {galleryImageUrls.map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        className={
                          normalizedGalleryIndex === index ? "active" : ""
                        }
                        onClick={() => setActiveCafeImageIndex(index)}
                        aria-label={`ดูรูปที่ ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="detail-side-card">
              <h3>คะแนนความนิยม</h3>
              <strong>{cafe.averageRating.toFixed(1)}</strong>

              <div className="detail-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={cafe.averageRating >= star ? "active" : ""}
                  />
                ))}
              </div>

              <p>จาก {cafe.totalReviews} รีวิว</p>

              {currentUser && (
                <a href="#review-form" className="detail-write-review-btn">
                  เขียนรีวิว
                </a>
              )}
            </div>
          </aside>
        </div>

        <div className="detail-wide-section photo-spot-wide-wrap">
          <div className="photo-spot-section">
            <div className="section-header photo-spot-header">
              <h2 className="photo-spot-heading">
                <FaCamera />
                จุดถ่ายรูปแนะนำ
              </h2>
            </div>

            {photoSpots.length > 0 ? (
              <div className="spot-grid">
                {photoSpots.map((spot, index) => (
                  <article
                    className="spot-card"
                    key={spot.id}
                    role={spot.imageUrl ? "button" : undefined}
                    tabIndex={spot.imageUrl ? 0 : undefined}
                    onClick={() => openImagePreview(getImageUrl(spot.imageUrl), spot.name)}
                    onKeyDown={(event) => {
                      if (
                        (event.key === "Enter" || event.key === " ") &&
                        spot.imageUrl
                      ) {
                        event.preventDefault();
                        openImagePreview(getImageUrl(spot.imageUrl), spot.name);
                      }
                    }}
                  >
                    <div className="spot-image">
                     {spot.imageUrl ? (
  <img src={getImageUrl(spot.imageUrl)} alt={spot.name} />
) : (
  <div className="spot-image-placeholder">
    <FaImage />
    <span>ไม่มีรูปภาพ</span>
  </div>
)}
                    </div>

                    <div className="spot-content">
                      <span className="spot-number">{index + 1}</span>

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

        <div className="detail-wide-section review-wide-wrap">
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
              <form
                id="review-form"
                className="review-form-card"
                onSubmit={handleSubmitReview}
              >
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
                          <img
                            src={getImageUrl(image.imageUrl)}
                            alt="review"
                            className="clickable-detail-image"
                            onClick={() => openImagePreview(image.imageUrl, "รูปรีวิว")}
                          />

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
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="clickable-detail-image"
                          onClick={() => openImagePreview(previewUrl, "รูปที่เลือก")}
                        />
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
                          src={getImageUrl(review.user.avatarUrl)}
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
                            <img
                              src={getImageUrl(imageUrl)}
                              alt="review"
                              key={imageUrl}
                              className="clickable-detail-image"
                              onClick={() => openImagePreview(imageUrl, "รูปรีวิว")}
                            />
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

            {previewImage && (
        <div
          className="image-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={closeImagePreview}
        >
          <button
            className="image-lightbox-close"
            type="button"
            onClick={closeImagePreview}
            aria-label="ปิดรูปภาพ"
          >
            <FaTimes />
          </button>

          <div
            className="image-lightbox-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={previewImage.url} alt={previewImage.title} />
            <p>{previewImage.title}</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default CafeDetailPage;