const FAVORITE_KEY = "smart_cafe_ubon_favorites";
export const FAVORITE_UPDATED_EVENT = "favorite-updated";

const getStoredIds = (): number[] => {
  const raw = localStorage.getItem(FAVORITE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const ids = JSON.parse(raw);

    if (!Array.isArray(ids)) {
      return [];
    }

    return ids.filter((id) => typeof id === "number");
  } catch {
    return [];
  }
};

const saveIds = (ids: number[]) => {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(FAVORITE_UPDATED_EVENT));
};

export const favoriteStorage = {
  getIds: () => {
    return getStoredIds();
  },

  isFavorite: (cafeId: number) => {
    return getStoredIds().includes(cafeId);
  },

  toggle: (cafeId: number) => {
    const currentIds = getStoredIds();

    if (currentIds.includes(cafeId)) {
      const nextIds = currentIds.filter((id) => id !== cafeId);
      saveIds(nextIds);
      return false;
    }

    const nextIds = [...currentIds, cafeId];
    saveIds(nextIds);
    return true;
  },

  remove: (cafeId: number) => {
    const nextIds = getStoredIds().filter((id) => id !== cafeId);
    saveIds(nextIds);
  },
};