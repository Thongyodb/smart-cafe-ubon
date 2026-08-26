import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaStar } from "react-icons/fa";
import type { Cafe } from "../../types/cafe";
import { favoriteService } from "../../services/favoriteService";
import { authStorage } from "../../utils/authStorage";
import { getCafeImageUrl } from "../../utils/imageUrl";

type Props = {
  cafe: Cafe;
  compact?: boolean;
  onSelect?: (cafe: Cafe) => void;
};

function AppCafeCard({ cafe, compact = false, onSelect }: Props) {
  const isLoggedIn = authStorage.isLoggedIn();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const imageUrl = getCafeImageUrl(cafe.coverImageUrl);

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

  const handleSelectCafe = () => {
    if (compact && onSelect) {
      onSelect(cafe);
    }
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!compact || !onSelect) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(cafe);
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

  const cardContent = (
    <>
      <div className="app-cafe-image">
        <img src={imageUrl} alt={cafe.name} />
      </div>

      <button
        type="button"
        className={`app-heart-btn ${isFavorite ? "active" : ""}`}
        onClick={handleToggleFavorite}
        disabled={loadingFavorite}
        aria-label="favorite"
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>

      <div className="app-cafe-body">
        <h3>{cafe.name}</h3>

        <p className="app-cafe-location">
          <FaMapMarkerAlt />
          {cafe.district?.name ?? "อุบลราชธานี"}
        </p>

        {!compact && (
          <div className="app-cafe-tags">
            {tags.length > 0 ? (
              tags.map((tag) => <span key={`${cafe.id}-${tag}`}>{tag}</span>)
            ) : (
              <span>{cafe.category?.name ?? "Cafe"}</span>
            )}
          </div>
        )}

        <div className="app-cafe-divider" />

        <div className="app-cafe-bottom">
          <strong>{priceText}</strong>

          <span>
            {rating.toFixed(1)}
            <FaStar />
          </span>
        </div>

        {compact && (
          <Link
            to={`/cafes/${cafe.id}`}
            className="app-cafe-detail-link"
            onClick={(event) => event.stopPropagation()}
          >
            ดูรายละเอียดร้าน
          </Link>
        )}
      </div>
    </>
  );

  if (compact) {
    return (
      <article
        className="app-cafe-card app-cafe-card-compact"
        role="button"
        tabIndex={0}
        onClick={handleSelectCafe}
        onKeyDown={handleCardKeyDown}
      >
        {cardContent}
      </article>
    );
  }

  return (
    <Link to={`/cafes/${cafe.id}`} className="app-cafe-card">
      {cardContent}
    </Link>
  );
}

export default AppCafeCard;