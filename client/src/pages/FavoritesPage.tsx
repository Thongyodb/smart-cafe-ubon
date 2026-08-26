import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { favoriteService } from "../services/favoriteService";
import type { Cafe } from "../types/cafe";
import { getCafeImageUrl } from "../utils/imageUrl";

function FavoritesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        const result = await favoriteService.getFavorites();

        if (isMounted) {
          setCafes(result.data);
        }
      } catch {
        if (isMounted) {
          alert("โหลดรายการโปรดไม่สำเร็จ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveFavorite = async (cafeId: number) => {
    const confirmed = confirm("ต้องการลบคาเฟ่นี้ออกจากรายการโปรดใช่ไหม?");

    if (!confirmed) {
      return;
    }

    try {
      await favoriteService.toggleFavorite(cafeId);

      setCafes((current) => current.filter((cafe) => cafe.id !== cafeId));
    } catch {
      alert("ลบรายการโปรดไม่สำเร็จ");
    }
  };

  return (
    <main className="favorite-page-redesign">
      <section className="favorite-page-container">
        <div className="favorite-page-header">
          <span>SAVED SPOTS</span>
          <h1>รายการโปรด</h1>
          <p>คาเฟ่ที่คุณบันทึกไว้ในบัญชีของคุณ</p>
        </div>

        {loading && (
          <p className="favorite-status-text">กำลังโหลดรายการโปรด...</p>
        )}

        {!loading && cafes.length === 0 && (
          <div className="favorite-empty-card">
            <h2>ยังไม่มีรายการโปรด</h2>
            <p>กดหัวใจที่คาเฟ่ที่ชอบ เพื่อบันทึกไว้ดูภายหลัง</p>

            <Link to="/explore">ไปสำรวจคาเฟ่</Link>
          </div>
        )}

        {!loading && cafes.length > 0 && (
          <div className="favorite-grid">
            {cafes.map((cafe) => (
              <FavoriteCafeCard
                cafe={cafe}
                key={cafe.id}
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function FavoriteCafeCard({
  cafe,
  onRemove,
}: {
  cafe: Cafe;
  onRemove: (cafeId: number) => void;
}) {
  const imageUrl = getCafeImageUrl(cafe.coverImageUrl);

  const cafeTags =
    cafe.cafeTags
      ?.map((cafeTag) => cafeTag.tag?.name)
      .filter((tag): tag is string => Boolean(tag)) ?? [];

  const tags =
    cafeTags.length > 0
      ? cafeTags.slice(0, 6)
      : cafe.category?.name
      ? [cafe.category.name]
      : ["Cafe"];

  const priceText =
    cafe.priceMin || cafe.priceMax
      ? `${cafe.priceMin ?? 0}฿ ~ ${cafe.priceMax ?? 0}฿`
      : "ไม่ระบุราคา";

  const rating = Number(cafe.averageRating ?? 0);

  return (
    <article className="favorite-cafe-card">
      <Link to={`/cafes/${cafe.id}`} className="favorite-cafe-image">
        <img src={imageUrl} alt={cafe.name} />
      </Link>

      <div className="favorite-cafe-content">
        <Link to={`/cafes/${cafe.id}`} className="favorite-cafe-title">
          {cafe.name}
        </Link>

        <p className="favorite-cafe-location">
          <FaLocationDot />
          {cafe.district?.name ?? "อุบลราชธานี"}
        </p>

        <div className="favorite-cafe-tags">
          {tags.map((tag) => (
            <span key={`${cafe.id}-${tag}`}>{tag}</span>
          ))}
        </div>

        <div className="favorite-cafe-bottom">
          <strong>{priceText}</strong>

          <span>
            {rating.toFixed(1)}
            <FaStar />
          </span>
        </div>

        <button
          className="favorite-remove-btn"
          type="button"
          onClick={() => onRemove(cafe.id)}
        >
          ลบออกจากรายการโปรด
        </button>
      </div>
    </article>
  );
}

export default FavoritesPage;