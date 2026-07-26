import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaStar, FaTrash, FaUpload } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import {
  cafeImageService,
  type CafeImageItem,
} from "../../services/cafeImageService";
import type { Cafe } from "../../types/cafe";

const MAX_UPLOAD_FILES = 10;

function AdminCafeImagesPage() {
  const { id } = useParams();
  const cafeId = Number(id);

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [images, setImages] = useState<CafeImageItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const coverImageUrl = cafe?.coverImageUrl ?? "";

const previewUrls = useMemo(() => {
  return selectedFiles.map((file) => URL.createObjectURL(file));
}, [selectedFiles]);

const canUpload = useMemo(() => {
  return selectedFiles.length > 0 && selectedFiles.length <= MAX_UPLOAD_FILES;
}, [selectedFiles]);

  const fetchCafeAndImages = async () => {
    const [cafeResult, imageResult] = await Promise.all([
      cafeService.getById(cafeId),
      cafeImageService.getCafeImages(cafeId),
    ]);

    setCafe(cafeResult.data);
    setImages(imageResult.data);
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
          setCafe(cafeResult.data);
          setImages(imageResult.data);
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

      const imageResult = await cafeImageService.getCafeImages(cafeId);
      const cafeResult = await cafeService.getById(cafeId);

      setImages(imageResult.data);
      setCafe(cafeResult.data);

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
      await fetchCafeAndImages();

      alert("ตั้งเป็นรูปหน้าปกสำเร็จ");
    } catch {
      alert("ตั้งรูปหน้าปกไม่สำเร็จ");
    }
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
              const isCover = image.imageUrl === coverImageUrl;

              return (
                <article className="admin-cafe-image-card" key={image.id}>
                  <div className="admin-cafe-image-frame">
                    <img src={image.imageUrl} alt="cafe" />

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
            <span className="admin-eyebrow">Current Cover</span>
            <h2>รูปหน้าปกปัจจุบัน</h2>
          </div>
        </div>

        {coverImageUrl ? (
          <div className="admin-current-cover">
            <img src={coverImageUrl} alt="cover" />
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