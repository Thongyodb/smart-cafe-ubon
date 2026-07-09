import { useEffect, useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import { metaService } from "../../services/metaService";
import type { Category, District, Tag } from "../../types/cafe";

export type CafeFilterState = {
  categoryId?: number;
  districtId?: number;
  tagIds: number[];
};

type Props = {
  filters: CafeFilterState;
  onChange: (filters: CafeFilterState) => void;
  onClear: () => void;
};

function CafeFilterBar({ filters, onChange, onClear }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const loadFilters = async () => {
      const result = await metaService.getFilters();

      setCategories(result.data.categories);
      setDistricts(result.data.districts);
      setTags(result.data.tags);
    };

    loadFilters();
  }, []);

  const handleToggleTag = (tagId: number) => {
    const isSelected = filters.tagIds.includes(tagId);

    onChange({
      ...filters,
      tagIds: isSelected
        ? filters.tagIds.filter((id) => id !== tagId)
        : [...filters.tagIds, tagId],
    });
  };

  return (
    <div className="cafe-filter-bar">
      <div className="cafe-filter-title">
        <FaFilter />
        <strong>ตัวกรองคาเฟ่</strong>
      </div>

      <div className="cafe-filter-row">
        <select
          value={filters.categoryId ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              categoryId: event.target.value
                ? Number(event.target.value)
                : undefined,
            })
          }
        >
          <option value="">ทุกประเภท</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.districtId ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              districtId: event.target.value
                ? Number(event.target.value)
                : undefined,
            })
          }
        >
          <option value="">ทุกอำเภอ</option>
          {districts.map((district) => (
            <option value={district.id} key={district.id}>
              {district.name}
            </option>
          ))}
        </select>

        <button className="clear-filter-btn" type="button" onClick={onClear}>
          <FaTimes />
          ล้างตัวกรอง
        </button>
      </div>

      <div className="cafe-filter-tags">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={
              filters.tagIds.includes(tag.id)
                ? "filter-tag-btn active"
                : "filter-tag-btn"
            }
            onClick={() => handleToggleTag(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CafeFilterBar;