import { useEffect, useState } from "react";
import AppCafeCard from "../components/app/AppCafeCard";
import { cafeService } from "../services/cafeService";
import type { Cafe } from "../types/cafe";
import {
  FAVORITE_UPDATED_EVENT,
  favoriteStorage,
} from "../utils/favoriteStorage";

function FavoritesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);

  const loadFavorites = async () => {
    const result = await cafeService.getCafes({});
    const favoriteIds = favoriteStorage.getIds();

    const favoriteCafes = result.data.filter((cafe) =>
      favoriteIds.includes(cafe.id)
    );

    setCafes(favoriteCafes);
  };

  useEffect(() => {
    loadFavorites();

    window.addEventListener(FAVORITE_UPDATED_EVENT, loadFavorites);

    return () => {
      window.removeEventListener(FAVORITE_UPDATED_EVENT, loadFavorites);
    };
  }, []);

  const handleRemoveFavorite = (cafeId: number) => {
    favoriteStorage.remove(cafeId);
  };

  return (
    <main className="app-page simple-page">
      <div className="simple-header">
        <span className="eyebrow">Saved Spots</span>
        <h1>รายการโปรด</h1>
      </div>

      {cafes.length === 0 && (
        <div className="empty-favorite-card">
          <h2>ยังไม่มีรายการโปรด</h2>
          <p>กดหัวใจที่คาเฟ่ที่ชอบ เพื่อบันทึกไว้ดูภายหลัง</p>
        </div>
      )}

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
    </main>
  );
}

export default FavoritesPage;