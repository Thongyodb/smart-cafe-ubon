import { useEffect, useMemo, useState } from "react";
import { FaCoffee, FaEye, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { cafeService } from "../../services/cafeService";
import type { Cafe } from "../../types/cafe";

function AdminDashboardPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const result = await cafeService.getCafes({});
      setCafes(result.data);
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalViews = cafes.reduce((sum, cafe) => sum + cafe.totalViews, 0);
    const totalPhotoSpots = cafes.reduce(
      (sum, cafe) => sum + (cafe.photoSpots?.length ?? 0),
      0
    );

    const averageRating =
      cafes.length > 0
        ? cafes.reduce((sum, cafe) => sum + cafe.averageRating, 0) /
          cafes.length
        : 0;

    return {
      totalCafes: cafes.length,
      totalViews,
      totalPhotoSpots,
      averageRating: averageRating.toFixed(1),
    };
  }, [cafes]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Overview</span>
          <h1>แดชบอร์ดผู้ดูแลระบบ</h1>
          <p>ภาพรวมข้อมูลคาเฟ่ จุดถ่ายรูป และสถิติการเข้าชม</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <FaCoffee />
          <span>คาเฟ่ทั้งหมด</span>
          <strong>{stats.totalCafes}</strong>
        </div>

        <div className="admin-stat-card">
          <FaMapMarkerAlt />
          <span>จุดถ่ายรูป</span>
          <strong>{stats.totalPhotoSpots}</strong>
        </div>

        <div className="admin-stat-card">
          <FaStar />
          <span>คะแนนเฉลี่ย</span>
          <strong>{stats.averageRating}</strong>
        </div>

        <div className="admin-stat-card">
          <FaEye />
          <span>ยอดเข้าชมรวม</span>
          <strong>{stats.totalViews}</strong>
        </div>
      </div>

      <section className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <span className="admin-eyebrow">Latest Cafes</span>
            <h2>คาเฟ่ในระบบ</h2>
          </div>
        </div>

        <div className="admin-mini-list">
          {cafes.map((cafe) => (
            <div className="admin-mini-item" key={cafe.id}>
              <img src={cafe.coverImageUrl ?? ""} alt={cafe.name} />

              <div>
                <strong>{cafe.name}</strong>
                <span>{cafe.district.name}</span>
              </div>

              <small>{cafe.averageRating.toFixed(1)} ★</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;