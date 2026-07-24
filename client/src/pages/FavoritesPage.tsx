import { useEffect, useState } from "react";
import AppCafeCard from "../components/app/AppCafeCard";
import { favoriteService } from "../services/favoriteService";
import type { Cafe } from "../types/cafe";

function FavoritesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        const result = await favoriteService.getFavorites();

        if (isMounted) {
          setCafes(result.data);
        }
      } catch {
        if (isMounted) {
          alert("โหลดรายการโปรดไม่สำเร็จ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveFavorite = async (cafeId: number) => {
    const confirmed = confirm("ต้องการลบคาเฟ่นี้ออกจากรายการโปรดใช่ไหม?");

    if (!confirmed) {
      return;
    }

    try {
      await favoriteService.toggleFavorite(cafeId);

      setCafes((current) => current.filter((cafe) => cafe.id !== cafeId));
    } catch {
      alert("ลบรายการโปรดไม่สำเร็จ");
    }
  };

  return (
    <main className="app-page simple-page">
      <div className="simple-header">
        <span className="eyebrow">Saved Spots</span>
        <h1>รายการโปรด</h1>
        <p>คาเฟ่ที่คุณบันทึกไว้ในบัญชีของคุณ</p>
      </div>

      {loading && <p className="status-text">กำลังโหลดรายการโปรด...</p>}

      {!loading && cafes.length === 0 && (
        <div className="empty-favorite-card">
          <h2>ยังไม่มีรายการโปรด</h2>
          <p>กดหัวใจที่คาเฟ่ที่ชอบ เพื่อบันทึกไว้ดูภายหลัง</p>
        </div>
      )}

      {!loading && cafes.length > 0 && (
        <div className="favorite-layout">
          {cafes.map((cafe) => (
            <div className="favorite-card" key={cafe.id}>
              <AppCafeCard cafe={cafe} showFavorite={false} />

              <button
                className="remove-favorite-btn"
                type="button"
                onClick={() => handleRemoveFavorite(cafe.id)}
              >
                ลบออกจากรายการโปรด
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default FavoritesPage;