import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaStar } from "react-icons/fa";
import type { Cafe } from "../../types/cafe";
import { favoriteService } from "../../services/favoriteService";
import { authStorage } from "../../utils/authStorage";

type Props = {
  cafe: Cafe;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80";

function AppCafeCard({ cafe }: Props) {
  const isLoggedIn = authStorage.isLoggedIn();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const imageUrl = cafe.coverImageUrl || FALLBACK_IMAGE;

  const tags = useMemo(() => {
    return (
      cafe.cafeTags
        ?.map((cafeTag) => cafeTag.tag?.name)
        .filter((tag): tag is string => Boolean(tag)) ?? []
    );
  }, [cafe.cafeTags]);

  const rating = Number(cafe.averageRating ?? 0);

  const priceMin = cafe.priceMin ?? 0;
  const priceMax = cafe.priceMax ?? 0;

  const priceText =
    priceMin > 0 || priceMax > 0
      ? `${priceMin}฿ ~ ${priceMax}฿`
      : "ไม่ระบุราคา";

  const handleToggleFavorite = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoadingFavorite(true);

      await favoriteService.toggleFavorite(cafe.id);

      setIsFavorite((currentValue) => !currentValue);
    } catch {
      alert("ไม่สามารถบันทึกรายการโปรดได้");
    } finally {
      setLoadingFavorite(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      return () => {
        isMounted = false;
      };
    }

    const loadFavoriteStatus = async () => {
      try {
        const result = await favoriteService.getFavorites();
        const favorites: Cafe[] = result.data ?? [];

        if (isMounted) {
          setIsFavorite(favorites.some((item) => item.id === cafe.id));
        }
      } catch {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [cafe.id, isLoggedIn]);

  return (
    <Link to={`/cafes/${cafe.id}`} className="app-cafe-card">
      <div className="app-cafe-image">
        <img src={imageUrl} alt={cafe.name} />

        <button
          type="button"
          className={`app-heart-btn ${isFavorite ? "active" : ""}`}
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          aria-label="favorite"
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="app-cafe-body">
        <h3>{cafe.name}</h3>

        <p className="app-cafe-location">
          <FaMapMarkerAlt />
          {cafe.district?.name ?? "อุบลราชธานี"}
        </p>

        <div className="app-cafe-tags">
          {tags.length > 0 ? (
            tags.map((tag) => <span key={`${cafe.id}-${tag}`}>{tag}</span>)
          ) : (
            <span>{cafe.category?.name ?? "Cafe"}</span>
          )}
        </div>

        <div className="app-cafe-divider" />

        <div className="app-cafe-bottom">
          <strong>{priceText}</strong>

          <span>
            {rating.toFixed(1)}
            <FaStar />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default AppCafeCard;