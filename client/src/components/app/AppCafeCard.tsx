import { useEffect, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaStar } from "react-icons/fa";
import { favoriteService } from "../../services/favoriteService";
import type { Cafe } from "../../types/cafe";
import { authStorage } from "../../utils/authStorage";

type Props = {
  cafe: Cafe;
  compact?: boolean;
  showFavorite?: boolean;
};

function AppCafeCard({ cafe, compact = false, showFavorite = true }: Props) {
  const navigate = useNavigate();
  const firstTag = cafe.cafeTags?.[0]?.tag.name ?? cafe.category.name;
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (!authStorage.isLoggedIn()) {
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

  const handleToggleFavorite = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

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
    <Link
      to={`/cafes/${cafe.id}`}
      className={compact ? "app-cafe-card compact" : "app-cafe-card"}
    >
      <div className="app-cafe-image">
        <img src={cafe.coverImageUrl ?? ""} alt={cafe.name} />

        {showFavorite && (
          <button
            className={isFavorite ? "app-heart-btn active" : "app-heart-btn"}
            type="button"
            onClick={handleToggleFavorite}
            disabled={savingFavorite}
            aria-label={
              isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"
            }
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>

      <div className="app-cafe-body">
        <h3>{cafe.name}</h3>
        <p>{firstTag}</p>

        <div className="app-cafe-meta">
          <span>
            <FaStar /> {cafe.averageRating.toFixed(1)}
          </span>

          <span>
            <FaMapMarkerAlt /> {cafe.district.name}
          </span>
        </div>

        <small>
          ฿{cafe.priceMin ?? "-"} - ฿{cafe.priceMax ?? "-"}
          {cafe.distanceKm !== undefined && (
            <span className="distance-text"> · {cafe.distanceKm} km</span>
          )}
        </small>
      </div>
    </Link>
  );
}

export default AppCafeCard;