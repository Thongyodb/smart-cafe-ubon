import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import { metaService } from "../../services/metaService";
import type { Category, District, Tag } from "../../types/cafe";

function AdminCafeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editCafeId = id ? Number(id) : null;
  const isEditMode = Boolean(editCafeId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "15.2287",
    longitude: "104.8564",
    openTime: "09:00",
    closeTime: "18:00",
    phone: "",
    facebookUrl: "",
    instagramUrl: "",
    websiteUrl: "",
    coverImageUrl: "",
    priceMin: "",
    priceMax: "",
    categoryId: "",
    districtId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const filterResult = await metaService.getFilters();

        setCategories(filterResult.data.categories);
        setDistricts(filterResult.data.districts);
        setTags(filterResult.data.tags);

        if (isEditMode && editCafeId) {
          const cafeResult = await cafeService.getCafeById(editCafeId);
          const cafe = cafeResult.data;

          setForm({
            name: cafe.name ?? "",
            description: cafe.description ?? "",
            address: cafe.address ?? "",
            latitude: String(cafe.latitude ?? "15.2287"),
            longitude: String(cafe.longitude ?? "104.8564"),
            openTime: cafe.openTime ?? "09:00",
            closeTime: cafe.closeTime ?? "18:00",
            phone: cafe.phone ?? "",
            facebookUrl: cafe.facebookUrl ?? "",
            instagramUrl: cafe.instagramUrl ?? "",
            websiteUrl: cafe.websiteUrl ?? "",
            coverImageUrl: cafe.coverImageUrl ?? "",
            priceMin: cafe.priceMin ? String(cafe.priceMin) : "",
            priceMax: cafe.priceMax ? String(cafe.priceMax) : "",
            categoryId: cafe.category?.id ? String(cafe.category.id) : "",
            districtId: cafe.district?.id ? String(cafe.district.id) : "",
          });

          setSelectedTagIds(
            cafe.cafeTags?.map((cafeTag) => cafeTag.tag.id) ?? []
          );
        }
      } catch {
        alert("โหลดข้อมูลไม่สำเร็จ");
        navigate("/admin/cafes");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [editCafeId, isEditMode, navigate]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((selectedId) => selectedId !== tagId)
        : [...current, tagId]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.address || !form.categoryId || !form.districtId) {
      alert("กรุณากรอกชื่อร้าน ที่อยู่ ประเภท และอำเภอ");
      return;
    }

    if (!form.latitude || !form.longitude) {
      alert("กรุณากรอก Latitude และ Longitude");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      address: form.address,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      openTime: form.openTime,
      closeTime: form.closeTime,
      phone: form.phone,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
      websiteUrl: form.websiteUrl,
      coverImageUrl: form.coverImageUrl,
      priceMin: form.priceMin ? Number(form.priceMin) : null,
      priceMax: form.priceMax ? Number(form.priceMax) : null,
      categoryId: Number(form.categoryId),
      districtId: Number(form.districtId),
      tagIds: selectedTagIds,
    };

    setSaving(true);

    try {
      if (isEditMode && editCafeId) {
        await cafeService.updateCafe(editCafeId, payload);
        alert("แก้ไขคาเฟ่สำเร็จ");
      } else {
        await cafeService.createCafe(payload);
        alert("เพิ่มคาเฟ่สำเร็จ");
      }

      navigate("/admin/cafes");
    } catch {
      alert(
        isEditMode
          ? "แก้ไขคาเฟ่ไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง"
          : "เพิ่มคาเฟ่ไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-section-card">
          <p>กำลังโหลดข้อมูลคาเฟ่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">
            {isEditMode ? "Edit Cafe" : "Create Cafe"}
          </span>

          <h1>{isEditMode ? "แก้ไขข้อมูลคาเฟ่" : "เพิ่มคาเฟ่ใหม่"}</h1>

          <p>
            {isEditMode
              ? "แก้ไขข้อมูลร้าน พิกัด เวลาเปิดปิด รูปภาพ และแท็กของคาเฟ่"
              : "กรอกข้อมูลร้าน พิกัด เวลาเปิดปิด รูปภาพ และแท็กสำหรับแสดงบนหน้าเว็บ"}
          </p>
        </div>

        <button
          className="admin-secondary-btn"
          type="button"
          onClick={() => navigate("/admin/cafes")}
        >
          <FaTimes />
          ยกเลิก
        </button>
      </div>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label>
            ชื่อร้าน
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="เช่น Minimal Garden Cafe"
            />
          </label>

          <label>
            เบอร์โทร
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="0800000000"
            />
          </label>

          <label className="admin-form-full">
            รายละเอียดร้าน
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="คำอธิบายบรรยากาศร้าน จุดเด่น หรือสไตล์ร้าน"
            />
          </label>

          <label className="admin-form-full">
            ที่อยู่
            <input
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี"
            />
          </label>

          <label>
            Latitude
            <input
              value={form.latitude}
              onChange={(event) => updateField("latitude", event.target.value)}
              placeholder="15.2287"
            />
          </label>

          <label>
            Longitude
            <input
              value={form.longitude}
              onChange={(event) => updateField("longitude", event.target.value)}
              placeholder="104.8564"
            />
          </label>

          <label>
            เวลาเปิด
            <input
              type="time"
              value={form.openTime}
              onChange={(event) => updateField("openTime", event.target.value)}
            />
          </label>

          <label>
            เวลาปิด
            <input
              type="time"
              value={form.closeTime}
              onChange={(event) => updateField("closeTime", event.target.value)}
            />
          </label>

          <label>
            ราคาเริ่มต้น
            <input
              value={form.priceMin}
              onChange={(event) => updateField("priceMin", event.target.value)}
              placeholder="60"
            />
          </label>

          <label>
            ราคาสูงสุด
            <input
              value={form.priceMax}
              onChange={(event) => updateField("priceMax", event.target.value)}
              placeholder="180"
            />
          </label>

          <label>
            ประเภท
            <select
              value={form.categoryId}
              onChange={(event) =>
                updateField("categoryId", event.target.value)
              }
            >
              <option value="">เลือกประเภท</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            อำเภอ
            <select
              value={form.districtId}
              onChange={(event) =>
                updateField("districtId", event.target.value)
              }
            >
              <option value="">เลือกอำเภอ</option>
              {districts.map((district) => (
                <option value={district.id} key={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-form-full">
            รูปหน้าปก URL
            <input
              value={form.coverImageUrl}
              onChange={(event) =>
                updateField("coverImageUrl", event.target.value)
              }
              placeholder="https://images.unsplash.com/..."
            />
          </label>

          <label>
            Facebook URL
            <input
              value={form.facebookUrl}
              onChange={(event) =>
                updateField("facebookUrl", event.target.value)
              }
              placeholder="https://facebook.com/..."
            />
          </label>

          <label>
            Instagram URL
            <input
              value={form.instagramUrl}
              onChange={(event) =>
                updateField("instagramUrl", event.target.value)
              }
              placeholder="https://instagram.com/..."
            />
          </label>

          <label className="admin-form-full">
            Website URL
            <input
              value={form.websiteUrl}
              onChange={(event) => updateField("websiteUrl", event.target.value)}
              placeholder="https://example.com"
            />
          </label>
        </div>

        <div className="admin-form-tags">
          <strong>Tags</strong>

          <div>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={
                  selectedTagIds.includes(tag.id)
                    ? "filter-tag-btn active"
                    : "filter-tag-btn"
                }
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-form-actions">
          <button className="admin-primary-btn" type="submit" disabled={saving}>
            <FaSave />
            {saving
              ? "กำลังบันทึก..."
              : isEditMode
                ? "บันทึกการแก้ไข"
                : "บันทึกคาเฟ่"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCafeFormPage;