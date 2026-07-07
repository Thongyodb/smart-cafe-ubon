import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaStar } from "react-icons/fa";
import type { Cafe } from "../../types/cafe";
import {
  FAVORITE_UPDATED_EVENT,
  favoriteStorage,
} from "../../utils/favoriteStorage";

type Props = {
  cafe: Cafe;
  compact?: boolean;
  showFavorite?: boolean;
};

function AppCafeCard({ cafe, compact = false, showFavorite = true }: Props) {
  const firstTag = cafe.cafeTags?.[0]?.tag.name ?? cafe.category.name;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const updateFavoriteState = () => {
      setIsFavorite(favoriteStorage.isFavorite(cafe.id));
    };

    updateFavoriteState();

    window.addEventListener(FAVORITE_UPDATED_EVENT, updateFavoriteState);

    return () => {
      window.removeEventListener(FAVORITE_UPDATED_EVENT, updateFavoriteState);
    };
  }, [cafe.id]);

  const handleToggleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const nextState = favoriteStorage.toggle(cafe.id);
    setIsFavorite(nextState);
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
        </small>
      </div>
    </Link>
  );
}

export default AppCafeCard;