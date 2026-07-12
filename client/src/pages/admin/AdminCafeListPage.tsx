import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import type { Cafe } from "../../types/cafe";

function AdminCafeListPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadCafes = async () => {
      const result = await cafeService.getCafes({});
      setCafes(result.data);
    };

    loadCafes();
  }, []);

  const filteredCafes = useMemo(() => {
    return cafes.filter((cafe) =>
      cafe.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [cafes, search]);

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Cafe Management</span>
          <h1>จัดการคาเฟ่</h1>
          <p>ดูรายการคาเฟ่ทั้งหมดในระบบ และเตรียมสำหรับเพิ่ม/แก้ไขข้อมูล</p>
        </div>

        <button
          className="admin-primary-btn"
          type="button"
          onClick={() => alert("เดี๋ยวเราจะทำหน้าเพิ่มคาเฟ่ในขั้นตอนถัดไป")}
        >
          <FaPlus />
          เพิ่มคาเฟ่
        </button>
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

                      <button
                        className="admin-icon-btn"
                        type="button"
                        onClick={() =>
                          alert("เดี๋ยวเราจะทำหน้าแก้ไขคาเฟ่ต่อไป")
                        }
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="admin-icon-btn danger"
                        type="button"
                        onClick={() =>
                          alert("เดี๋ยวเราจะทำระบบลบ/ปิดใช้งานต่อไป")
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminCafeListPage;