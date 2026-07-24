import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { favoriteService } from "../services/favoriteService";
import type { Cafe } from "../types/cafe";
import { authStorage } from "../utils/authStorage";

type CafeCardProps = {
  cafe: Cafe;
};

function CafeCard({ cafe }: CafeCardProps) {
  const navigate = useNavigate();
  const tags = cafe.cafeTags?.map((item) => item.tag.name) ?? [];
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (!authStorage.isLoggedIn()) {
        if (isMounted) {
          setIsFavorite(false);
        }

        return;
      }

      try {
        const result = await favoriteService.getFavorites();

        const found = result.data.some(
          (favoriteCafe) => favoriteCafe.id === cafe.id
        );

        if (isMounted) {
          setIsFavorite(found);
        }
      } catch {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    };

    void loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [cafe.id]);

  const handleToggleFavorite = async () => {
    if (!authStorage.isLoggedIn()) {
      navigate("/login");
      return;
    }

    try {
      setSavingFavorite(true);

      const result = await favoriteService.toggleFavorite(cafe.id);
      setIsFavorite(result.data.isFavorite);
    } catch {
      alert("อัปเดตรายการโปรดไม่สำเร็จ");
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <div className="cafe-card">
      <div className="cafe-image-wrapper">
        <img
          src={
            cafe.coverImageUrl ||
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"
          }
          alt={cafe.name}
          className="cafe-image"
        />

        <button
          className={`favorite-btn ${isFavorite ? "active" : ""}`}
          type="button"
          onClick={handleToggleFavorite}
          disabled={savingFavorite}
          title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          <FaHeart />
        </button>

        <div className="rating-badge">
          <FaStar />
          <span>{cafe.averageRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="cafe-content">
        <div className="cafe-meta">
          <span>{cafe.category.name}</span>
          <span>
            <FaEye /> {cafe.totalViews}
          </span>
        </div>

        <h3>{cafe.name}</h3>

        <p className="description">{cafe.description}</p>

        <div className="location">
          <FaMapMarkerAlt />
          <span>{cafe.district.name}</span>
        </div>

        <div className="tag-list">
          {tags.slice(0, 3).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <span className="price">
            ฿{cafe.priceMin ?? "-"} - ฿{cafe.priceMax ?? "-"}
          </span>

          <Link className="detail-btn" to={`/cafes/${cafe.id}`}>
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CafeCard;