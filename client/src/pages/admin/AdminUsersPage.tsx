import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaUserShield, FaUsers } from "react-icons/fa";
import { userService } from "../../services/userService";
import type { AdminUserItem } from "../../services/userService";

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    userService
      .getUsers()
      .then((result) => {
        if (isMounted) {
          setUsers(result.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          alert("โหลดข้อมูลสมาชิกไม่สำเร็จ");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((user) => {
      return (
        user.username?.toLowerCase().includes(keyword) ||
        user.fullName.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.provider.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const formatDate = (dateText: string) => {
    return new Date(dateText).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">User Management</span>
          <h1>จัดการสมาชิก</h1>
          <p>ดูรายชื่อสมาชิกทั้งหมดในระบบ วิธีสมัคร สิทธิ์ผู้ใช้ และวันที่สมัคร</p>
        </div>

        <div className="admin-users-summary">
          <FaUsers />
          <div>
            <strong>{users.length}</strong>
            <span>สมาชิกทั้งหมด</span>
          </div>
        </div>
      </div>

      <section className="admin-section-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <FaSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหา username, ชื่อ, อีเมล, provider..."
            />
          </div>

          <span>{filteredUsers.length} รายการ</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th>สมัครผ่าน</th>
                <th>สิทธิ์</th>
                <th>สถานะ</th>
                <th>วันที่สมัคร</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-cell">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} />
                      ) : (
                        <span>{user.fullName.charAt(0).toUpperCase()}</span>
                      )}

                      <div>
                        <strong>{user.fullName}</strong>
                        <small>
                          @{user.username ?? "-"}
                          {user.email ? ` • ${user.email}` : ""}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="provider-pill">{user.provider}</span>
                  </td>

                  <td>
                    <span
                      className={
                        user.role === "ADMIN"
                          ? "role-pill role-admin"
                          : "role-pill role-user"
                      }
                    >
                      {user.role === "ADMIN" && <FaUserShield />}
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill status-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>

                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-row">
                      ไม่พบข้อมูลสมาชิกที่ตรงกับการค้นหา
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

export default AdminUsersPage;