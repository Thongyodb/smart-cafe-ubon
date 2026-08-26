import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaRedo,
  FaSave,
  FaStar,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import {
  cafeImageService,
  type CafeImageItem,
} from "../../services/cafeImageService";
import type { Cafe } from "../../types/cafe";
import { getImageUrl } from "../../utils/imageUrl";

const MAX_UPLOAD_FILES = 10;

type CafeWithCoverFocus = Cafe & {
  coverFocusX?: number | string | null;
  coverFocusY?: number | string | null;
  coverZoom?: number | string | null;
};

const toNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
};

function AdminCafeImagesPage() {
  const { id } = useParams();
  const cafeId = Number(id);

  const [cafe, setCafe] = useState<CafeWithCoverFocus | null>(null);
  const [images, setImages] = useState<CafeImageItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingFocus, setSavingFocus] = useState(false);

  const [coverFocusX, setCoverFocusX] = useState(50);
  const [coverFocusY, setCoverFocusY] = useState(50);
  const [coverZoom, setCoverZoom] = useState(1);

  const rawCoverImageUrl = cafe?.coverImageUrl ?? "";
  const coverImageUrl = getImageUrl(rawCoverImageUrl);

  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  const canUpload = useMemo(() => {
    return selectedFiles.length > 0 && selectedFiles.length <= MAX_UPLOAD_FILES;
  }, [selectedFiles]);

  const applyCoverFocusFromCafe = (cafeData: CafeWithCoverFocus) => {
    setCoverFocusX(toNumber(cafeData.coverFocusX, 50));
    setCoverFocusY(toNumber(cafeData.coverFocusY, 50));
    setCoverZoom(toNumber(cafeData.coverZoom, 1));
  };

  const fetchCafeAndImages = async () => {
    const [cafeResult, imageResult] = await Promise.all([
      cafeService.getById(cafeId),
      cafeImageService.getCafeImages(cafeId),
    ]);

    const cafeData = cafeResult.data as CafeWithCoverFocus;

    setCafe(cafeData);
    setImages(imageResult.data);
    applyCoverFocusFromCafe(cafeData);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [cafeResult, imageResult] = await Promise.all([
          cafeService.getById(cafeId),
          cafeImageService.getCafeImages(cafeId),
        ]);

        if (isMounted) {
          const cafeData = cafeResult.data as CafeWithCoverFocus;

          setCafe(cafeData);
          setImages(imageResult.data);
          applyCoverFocusFromCafe(cafeData);
        }
      } catch {
        if (isMounted) {
          alert("โหลดข้อมูลรูปภาพคาเฟ่ไม่สำเร็จ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!Number.isNaN(cafeId)) {
      void loadInitialData();
    }

    return () => {
      isMounted = false;
    };
  }, [cafeId]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const limitedFiles = imageFiles.slice(0, MAX_UPLOAD_FILES);

    setSelectedFiles(limitedFiles);
    event.target.value = "";
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const handleUploadImages = async () => {
    if (!canUpload) {
      alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป และไม่เกิน 10 รูป");
      return;
    }

    try {
      setUploading(true);

      await cafeImageService.uploadCafeImages(cafeId, selectedFiles);
      clearSelectedFiles();

      await fetchCafeAndImages();

      alert("อัปโหลดรูปภาพสำเร็จ");
    } catch {
      alert("อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image: CafeImageItem) => {
    const confirmed = window.confirm("ต้องการลบรูปภาพนี้ใช่ไหม?");

    if (!confirmed) {
      return;
    }

    try {
      await cafeImageService.deleteCafeImage(image.id);
      await fetchCafeAndImages();

      alert("ลบรูปภาพสำเร็จ");
    } catch {
      alert("ลบรูปภาพไม่สำเร็จ");
    }
  };

  const handleSetCoverImage = async (image: CafeImageItem) => {
    try {
      await cafeImageService.setCoverImage(image.id);

      await cafeService.updateCoverFocus(cafeId, {
        coverFocusX: 50,
        coverFocusY: 50,
        coverZoom: 1,
      });

      await fetchCafeAndImages();

      alert("ตั้งเป็นรูปหน้าปกสำเร็จ");
    } catch {
      alert("ตั้งรูปหน้าปกไม่สำเร็จ");
    }
  };

  const handleSaveCoverFocus = async () => {
    if (!rawCoverImageUrl) {
      alert("กรุณาตั้งรูปหน้าปกก่อน");
      return;
    }

    try {
      setSavingFocus(true);

      const result = await cafeService.updateCoverFocus(cafeId, {
        coverFocusX,
        coverFocusY,
        coverZoom,
      });

      const cafeData = result.data as CafeWithCoverFocus;

      setCafe(cafeData);
      applyCoverFocusFromCafe(cafeData);

      alert("บันทึกตำแหน่งรูปหน้าปกสำเร็จ");
    } catch {
      alert("บันทึกตำแหน่งรูปหน้าปกไม่สำเร็จ");
    } finally {
      setSavingFocus(false);
    }
  };

  const handleResetCoverFocus = () => {
    setCoverFocusX(50);
    setCoverFocusY(50);
    setCoverZoom(1);
  };

  const handleClickPreview = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setCoverFocusX(Number(x.toFixed(1)));
    setCoverFocusY(Number(y.toFixed(1)));
  };

  if (Number.isNaN(cafeId)) {
    return (
      <div className="admin-page">
        <div className="admin-section-card admin-empty-row">
          รหัสคาเฟ่ไม่ถูกต้อง
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p className="status-text">กำลังโหลดข้อมูลรูปภาพคาเฟ่...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Cafe Gallery</span>
          <h1>จัดการรูปภาพคาเฟ่</h1>
          <p>{cafe?.name ?? "ไม่พบชื่อคาเฟ่"}</p>
        </div>

        <Link to="/admin/cafes" className="admin-secondary-btn">
          <FaArrowLeft />
          กลับรายการคาเฟ่
        </Link>
      </div>

      <section className="admin-section-card">
        <div className="admin-section-title-row">
          <div>
            <span className="admin-eyebrow">Upload Images</span>
            <h2>อัปโหลดรูปภาพคาเฟ่</h2>
            <p>เลือกรูปภาพได้สูงสุดครั้งละ {MAX_UPLOAD_FILES} รูป</p>
          </div>
        </div>

        <div className="admin-cafe-image-upload-box">
          <label className="admin-cafe-image-file-label">
            <FaUpload />
            <span>เลือกรูปภาพ</span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSelectFiles}
            />
          </label>

          <div>
            <strong>{selectedFiles.length} รูปที่เลือก</strong>
            <p>รองรับไฟล์รูปภาพ ขนาดไม่เกิน 5MB ต่อรูป</p>
          </div>

          <button
            className="admin-primary-btn"
            type="button"
            disabled={!canUpload || uploading}
            onClick={handleUploadImages}
          >
            <FaUpload />
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
          </button>
        </div>

        {previewUrls.length > 0 && (
          <div className="admin-cafe-image-preview-grid">
            {previewUrls.map((url) => (
              <img src={url} alt="preview" key={url} />
            ))}
          </div>
        )}
      </section>

      <section className="admin-section-card">
        <div className="admin-section-title-row">
          <div>
            <span className="admin-eyebrow">Gallery</span>
            <h2>รูปภาพทั้งหมด</h2>
            <p>ลบรูปภาพ หรือตั้งรูปที่ต้องการเป็นรูปหน้าปก</p>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="admin-empty-row">ยังไม่มีรูปภาพของคาเฟ่นี้</div>
        ) : (
          <div className="admin-cafe-image-grid">
            {images.map((image) => {
              const imageUrl = getImageUrl(image.imageUrl);
              const isCover =
                image.imageUrl === rawCoverImageUrl ||
                imageUrl === coverImageUrl;

              return (
                <article className="admin-cafe-image-card" key={image.id}>
                  <div className="admin-cafe-image-frame">
                    <img src={imageUrl} alt="cafe" />

                    {isCover && (
                      <span className="admin-cafe-cover-badge">
                        <FaStar />
                        รูปหน้าปก
                      </span>
                    )}
                  </div>

                  <div className="admin-cafe-image-actions">
                    <button
                      className="admin-secondary-btn"
                      type="button"
                      disabled={isCover}
                      onClick={() => void handleSetCoverImage(image)}
                    >
                      <FaStar />
                      ตั้งเป็นหน้าปก
                    </button>

                    <button
                      className="admin-danger-btn"
                      type="button"
                      onClick={() => void handleDeleteImage(image)}
                    >
                      <FaTrash />
                      ลบรูป
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="admin-section-card">
        <div className="admin-section-title-row">
          <div>
            <span className="admin-eyebrow">Cover Focus</span>
            <h2>จัดมุมรูปหน้าปก</h2>
            <p>
              คลิกบนรูปเพื่อเลือกจุดโฟกัส หรือเลื่อนค่า X/Y/Zoom เองได้
            </p>
          </div>
        </div>

        {rawCoverImageUrl ? (
          <div className="admin-cover-focus-editor">
            <div
              className="admin-cover-focus-preview"
              role="button"
              tabIndex={0}
              onClick={handleClickPreview}
              style={{
                position: "relative",
                width: "100%",
                height: 360,
                overflow: "hidden",
                borderRadius: 22,
                background: "#111",
                cursor: "crosshair",
              }}
            >
              <img
                src={coverImageUrl}
                alt="cover preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `${coverFocusX}% ${coverFocusY}%`,
                  transform: `scale(${coverZoom})`,
                  transformOrigin: `${coverFocusX}% ${coverFocusY}%`,
                  transition: "transform 0.2s ease, object-position 0.2s ease",
                  display: "block",
                }}
              />

              <span
                title="จุดโฟกัส"
                style={{
                  position: "absolute",
                  left: `${coverFocusX}%`,
                  top: `${coverFocusY}%`,
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "3px solid white",
                  boxShadow: "0 0 0 3px rgba(13, 118, 117, 0.75)",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  fontSize: 13,
                  pointerEvents: "none",
                }}
              >
                คลิกตรงจุดที่อยากให้รูปโฟกัส
              </div>
            </div>

            <div
              className="admin-cover-focus-controls"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
                marginTop: 20,
              }}
            >
              <label>
                <strong>ซ้าย / ขวา: {coverFocusX}%</strong>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={coverFocusX}
                  onChange={(event) =>
                    setCoverFocusX(Number(event.target.value))
                  }
                  style={{ width: "100%" }}
                />
              </label>

              <label>
                <strong>บน / ล่าง: {coverFocusY}%</strong>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={coverFocusY}
                  onChange={(event) =>
                    setCoverFocusY(Number(event.target.value))
                  }
                  style={{ width: "100%" }}
                />
              </label>

              <label>
                <strong>ซูม: {coverZoom.toFixed(2)}x</strong>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={coverZoom}
                  onChange={(event) => setCoverZoom(Number(event.target.value))}
                  style={{ width: "100%" }}
                />
              </label>
            </div>

            <div
              className="admin-cafe-image-actions"
              style={{ marginTop: 20, justifyContent: "flex-end" }}
            >
              <button
                className="admin-secondary-btn"
                type="button"
                onClick={handleResetCoverFocus}
              >
                <FaRedo />
                รีเซ็ตกลางรูป
              </button>

              <button
                className="admin-primary-btn"
                type="button"
                disabled={savingFocus}
                onClick={() => void handleSaveCoverFocus()}
              >
                <FaSave />
                {savingFocus ? "กำลังบันทึก..." : "บันทึกตำแหน่งรูปปก"}
              </button>
            </div>

            <p style={{ marginTop: 12, color: "var(--app-muted)" }}>
              ค่าปัจจุบัน: X {coverFocusX}% / Y {coverFocusY}% / Zoom{" "}
              {coverZoom.toFixed(2)}x
            </p>
          </div>
        ) : (
          <div className="admin-empty-row">
            ยังไม่ได้ตั้งรูปหน้าปก ระบบจะใช้รูปแรกที่อัปโหลดเป็นหน้าปกอัตโนมัติ
          </div>
        )}
      </section>

      <section className="admin-section-card">
        <div className="admin-section-title-row">
          <div>
            <span className="admin-eyebrow">Current Cover</span>
            <h2>รูปหน้าปกปัจจุบัน</h2>
          </div>
        </div>

        {rawCoverImageUrl ? (
          <div className="admin-current-cover">
            <img
              src={coverImageUrl}
              alt="cover"
              style={{
                objectPosition: `${coverFocusX}% ${coverFocusY}%`,
                transform: `scale(${coverZoom})`,
                transformOrigin: `${coverFocusX}% ${coverFocusY}%`,
              }}
            />
          </div>
        ) : (
          <div className="admin-empty-row">
            ยังไม่ได้ตั้งรูปหน้าปก ระบบจะใช้รูปแรกที่อัปโหลดเป็นหน้าปกอัตโนมัติ
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminCafeImagesPage;