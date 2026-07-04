import { Link } from "react-router-dom";
import { FaEye, FaHeart, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import type { Cafe } from "../types/cafe";

type CafeCardProps = {
  cafe: Cafe;
};

function CafeCard({ cafe }: CafeCardProps) {
  const tags = cafe.cafeTags?.map((item) => item.tag.name) ?? [];

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

        <button className="favorite-btn" type="button">
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