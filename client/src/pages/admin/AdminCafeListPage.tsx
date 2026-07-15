import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import type { Cafe } from "../../types/cafe";

function AdminCafeListPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    cafeService
      .getCafes({})
      .then((result) => {
        if (isMounted) {
          setCafes(result.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          alert("โหลดข้อมูลคาเฟ่ไม่สำเร็จ");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCafes = useMemo(() => {
    return cafes.filter((cafe) =>
      cafe.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [cafes, search]);

  const handleDeleteCafe = async (cafe: Cafe) => {
    const confirmed = confirm(
      `ต้องการปิดใช้งานร้าน "${cafe.name}" ใช่ไหม?\nร้านนี้จะไม่แสดงบนหน้าเว็บ แต่ข้อมูลยังอยู่ในฐานข้อมูล`
    );

    if (!confirmed) {
      return;
    }

    try {
      await cafeService.deleteCafe(cafe.id);
      setCafes((current) => current.filter((item) => item.id !== cafe.id));
      alert("ปิดใช้งานคาเฟ่สำเร็จ");
    } catch {
      alert("ปิดใช้งานคาเฟ่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Cafe Management</span>
          <h1>จัดการคาเฟ่</h1>
          <p>ดูรายการคาเฟ่ทั้งหมดในระบบ เพิ่ม แก้ไข หรือปิดใช้งานคาเฟ่</p>
        </div>

        <Link className="admin-primary-btn" to="/admin/cafes/create">
          <FaPlus />
          เพิ่มคาเฟ่ใหม่
        </Link>
      </div>

      <section className="admin-section-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <FaSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อคาเฟ่..."
            />
          </div>

          <span>{filteredCafes.length} รายการ</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ร้าน</th>
                <th>ประเภท</th>
                <th>อำเภอ</th>
                <th>คะแนน</th>
                <th>ยอดเข้าชม</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {filteredCafes.map((cafe) => (
                <tr key={cafe.id}>
                  <td>
                    <div className="admin-cafe-cell">
                      <img src={cafe.coverImageUrl ?? ""} alt={cafe.name} />

                      <div>
                        <strong>{cafe.name}</strong>
                        <span>{cafe.address}</span>
                      </div>
                    </div>
                  </td>

                  <td>{cafe.category.name}</td>
                  <td>{cafe.district.name}</td>
                  <td>{cafe.averageRating.toFixed(1)} ★</td>
                  <td>{cafe.totalViews}</td>

                  <td>
                    <div className="admin-action-group">
                      <Link to={`/cafes/${cafe.id}`} className="admin-icon-btn">
                        <FaEye />
                      </Link>

                      <Link
                        to={`/admin/cafes/${cafe.id}/edit`}
                        className="admin-icon-btn"
                      >
                        <FaEdit />
                      </Link>

                      <button
                        className="admin-icon-btn danger"
                        type="button"
                        onClick={() => handleDeleteCafe(cafe)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCafes.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-row">
                      ไม่พบข้อมูลคาเฟ่ที่ตรงกับการค้นหา
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

export default AdminCafeListPage;