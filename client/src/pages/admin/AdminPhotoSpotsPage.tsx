import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  FaEdit,
  FaImage,
  FaPlus,
  FaSave,
  FaSearch,
  FaTrash,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { cafeService } from "../../services/cafeService";
import {
  photoSpotService,
  type PhotoSpotItem,
} from "../../services/photoSpotService";
import type { Cafe } from "../../types/cafe";

type PhotoSpotForm = {
  cafeId: string;
  name: string;
  description: string;
  imageUrl: string;
  bestTime: string;
  cameraAngle: string;
};

const API_BASE_URL = "http://localhost:5000";

const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

const emptyForm: PhotoSpotForm = {
  cafeId: "",
  name: "",
  description: "",
  imageUrl: "",
  bestTime: "",
  cameraAngle: "",
};

function AdminPhotoSpotsPage() {
  const [photoSpots, setPhotoSpots] = useState<PhotoSpotItem[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<PhotoSpotForm>(emptyForm);
  const [editingSpot, setEditingSpot] = useState<PhotoSpotItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [spotImageFile, setSpotImageFile] = useState<File | null>(null);
  const [spotImagePreview, setSpotImagePreview] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([photoSpotService.getPhotoSpots(), cafeService.getCafes({})])
      .then(([photoSpotResult, cafeResult]) => {
        if (isMounted) {
          setPhotoSpots(photoSpotResult.data);
          setCafes(cafeResult.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          alert("โหลดข้อมูลจุดถ่ายรูปไม่สำเร็จ");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPhotoSpots = useMemo(() => {
    const keyword = search.toLowerCase();

    return photoSpots.filter((spot) => {
      return (
        spot.name.toLowerCase().includes(keyword) ||
        spot.cafe.name.toLowerCase().includes(keyword) ||
        spot.cafe.district.name.toLowerCase().includes(keyword) ||
        spot.bestTime?.toLowerCase().includes(keyword) ||
        spot.cameraAngle?.toLowerCase().includes(keyword)
      );
    });
  }, [photoSpots, search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSpot(null);
    setSpotImageFile(null);
    setSpotImagePreview("");
  };

  const handleEdit = (spot: PhotoSpotItem) => {
    setEditingSpot(spot);
    setSpotImageFile(null);
    setSpotImagePreview(getImageUrl(spot.imageUrl));

    setForm({
      cafeId: String(spot.cafeId),
      name: spot.name,
      description: spot.description ?? "",
      imageUrl: spot.imageUrl ?? "",
      bestTime: spot.bestTime ?? "",
      cameraAngle: spot.cameraAngle ?? "",
    });
  };

  const handleSpotImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setSpotImageFile(selectedFile);
    setSpotImagePreview(previewUrl);

    event.target.value = "";
  };

  const handleRemoveSelectedImage = () => {
    setSpotImageFile(null);
    setSpotImagePreview(getImageUrl(form.imageUrl));
  };

  const buildFormData = (): FormData | null => {
    const cafeId = Number(form.cafeId);

    if (!cafeId || Number.isNaN(cafeId)) {
      alert("กรุณาเลือกร้านคาเฟ่");
      return null;
    }

    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อจุดถ่ายรูป");
      return null;
    }

    const formData = new FormData();

    formData.append("cafeId", String(cafeId));
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("imageUrl", form.imageUrl.trim());
    formData.append("bestTime", form.bestTime.trim());
    formData.append("cameraAngle", form.cameraAngle.trim());

    if (spotImageFile) {
      formData.append("image", spotImageFile);
    }

    return formData;
  };

  const handleSubmit = async () => {
    const formData = buildFormData();

    if (!formData) {
      return;
    }

    try {
      setSaving(true);

      if (editingSpot) {
        const result = await photoSpotService.updatePhotoSpot(
          editingSpot.id,
          formData
        );

        setPhotoSpots((current) =>
          current.map((spot) =>
            spot.id === editingSpot.id ? result.data : spot
          )
        );

        alert("แก้ไขจุดถ่ายรูปสำเร็จ");
      } else {
        const result = await photoSpotService.createPhotoSpot(formData);

        setPhotoSpots((current) => [result.data, ...current]);

        alert("เพิ่มจุดถ่ายรูปสำเร็จ");
      }

      resetForm();
    } catch {
      alert("บันทึกจุดถ่ายรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (spot: PhotoSpotItem) => {
    const confirmed = confirm(`ต้องการลบจุดถ่ายรูป "${spot.name}" ใช่ไหม?`);

    if (!confirmed) {
      return;
    }

    try {
      await photoSpotService.deletePhotoSpot(spot.id);

      setPhotoSpots((current) =>
        current.filter((item) => item.id !== spot.id)
      );

      if (editingSpot?.id === spot.id) {
        resetForm();
      }

      alert("ลบจุดถ่ายรูปสำเร็จ");
    } catch {
      alert("ลบจุดถ่ายรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Photo Spot Management</span>
          <h1>จัดการจุดถ่ายรูป</h1>
          <p>เพิ่ม แก้ไข หรือลบจุดถ่ายรูปที่ผูกกับแต่ละคาเฟ่</p>
        </div>

        <div className="admin-users-summary">
          <FaImage />
          <div>
            <strong>{photoSpots.length}</strong>
            <span>จุดถ่ายรูปทั้งหมด</span>
          </div>
        </div>
      </div>

      <section className="admin-section-card admin-photo-form-card">
        <div className="admin-form-title">
          <div>
            <h2>{editingSpot ? "แก้ไขจุดถ่ายรูป" : "เพิ่มจุดถ่ายรูปใหม่"}</h2>
            <p>กรอกข้อมูลมุมถ่ายรูป เวลาแนะนำ และมุมกล้อง</p>
          </div>

          {editingSpot && (
            <button
              className="admin-secondary-btn"
              type="button"
              onClick={resetForm}
            >
              <FaTimes />
              ยกเลิกแก้ไข
            </button>
          )}
        </div>

        <div className="admin-form-grid">
          <label>
            เลือกคาเฟ่
            <select
              value={form.cafeId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cafeId: event.target.value,
                }))
              }
            >
              <option value="">-- เลือกคาเฟ่ --</option>
              {cafes.map((cafe) => (
                <option value={cafe.id} key={cafe.id}>
                  {cafe.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            ชื่อจุดถ่ายรูป
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="เช่น มุมสวนหน้าร้าน"
            />
          </label>

          <label>
            เวลาที่แนะนำ
            <input
              value={form.bestTime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bestTime: event.target.value,
                }))
              }
              placeholder="เช่น 08:30-10:30"
            />
          </label>

          <label>
            มุมกล้อง
            <input
              value={form.cameraAngle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cameraAngle: event.target.value,
                }))
              }
              placeholder="เช่น ถ่ายย้อนแสง / มุมกว้าง"
            />
          </label>

          <div className="admin-form-full cafe-cover-upload-field">
            <span className="admin-upload-label">รูปจุดถ่ายรูป</span>

            <div className="admin-cover-upload-box">
              <div className="admin-cover-preview">
                {spotImagePreview ? (
                  <img src={spotImagePreview} alt="photo spot preview" />
                ) : (
                  <div>
                    <FaImage />
                    <span>ยังไม่มีรูปจุดถ่ายรูป</span>
                  </div>
                )}
              </div>

              <div className="admin-cover-upload-actions">
                <label className="admin-cover-upload-button">
                  <FaUpload />
                  <span>
                    {spotImagePreview
                      ? "เปลี่ยนรูปจุดถ่ายรูป"
                      : "อัปโหลดรูปจุดถ่ายรูป"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSpotImageChange}
                  />
                </label>

                {spotImageFile && (
                  <button
                    className="admin-cover-remove-button"
                    type="button"
                    onClick={handleRemoveSelectedImage}
                  >
                    <FaTimes />
                    ยกเลิกรูปที่เลือก
                  </button>
                )}

                {spotImageFile && (
                  <small>ไฟล์ที่เลือก: {spotImageFile.name}</small>
                )}
              </div>
            </div>
          </div>

          <label className="admin-form-full">
            รายละเอียด
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="รายละเอียดของจุดถ่ายรูป"
              rows={4}
            />
          </label>
        </div>

        <div className="admin-form-actions">
          <button
            className="admin-primary-btn"
            type="button"
            onClick={handleSubmit}
            disabled={saving}
          >
            {editingSpot ? <FaSave /> : <FaPlus />}
            {saving
              ? "กำลังบันทึก..."
              : editingSpot
              ? "บันทึกการแก้ไข"
              : "เพิ่มจุดถ่ายรูป"}
          </button>
        </div>
      </section>

      <section className="admin-section-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <FaSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อจุดถ่ายรูป คาเฟ่ อำเภอ เวลา หรือมุมกล้อง..."
            />
          </div>

          <span>{filteredPhotoSpots.length} รายการ</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>จุดถ่ายรูป</th>
                <th>คาเฟ่</th>
                <th>เวลาแนะนำ</th>
                <th>มุมกล้อง</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {filteredPhotoSpots.map((spot) => {
                const spotImageUrl = getImageUrl(spot.imageUrl);

                return (
                  <tr key={spot.id}>
                    <td>
                      <div className="admin-photo-spot-cell">
                        {spotImageUrl ? (
                          <img src={spotImageUrl} alt={spot.name} />
                        ) : (
                          <span>
                            <FaImage />
                          </span>
                        )}

                        <div>
                          <strong>{spot.name}</strong>
                          <small>{spot.description ?? "ไม่มีรายละเอียด"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>{spot.cafe.name}</strong>
                      <small className="admin-muted-block">
                        {spot.cafe.district.name}
                      </small>
                    </td>

                    <td>{spot.bestTime || "-"}</td>
                    <td>{spot.cameraAngle || "-"}</td>

                    <td>
                      <div className="admin-action-group">
                        <button
                          className="admin-icon-btn"
                          type="button"
                          onClick={() => handleEdit(spot)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="admin-icon-btn danger"
                          type="button"
                          onClick={() => handleDelete(spot)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPhotoSpots.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-row">
                      ไม่พบข้อมูลจุดถ่ายรูปที่ตรงกับการค้นหา
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminPhotoSpotsPage;