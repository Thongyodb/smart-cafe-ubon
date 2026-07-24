import { favoriteRepository } from "../repositories/favorite.repository";

export const favoriteService = {
  getFavorites: async (userId: number) => {
    const favorites = await favoriteRepository.findUserFavorites(userId);

    return favorites.map((favorite) => favorite.cafe);
  },

  toggleFavorite: async (userId: number, cafeId: number) => {
    const favorite = await favoriteRepository.findFavorite(userId, cafeId);

    if (favorite) {
      await favoriteRepository.removeFavorite(userId, cafeId);

      return {
        isFavorite: false,
        cafeId,
      };
    }

    await favoriteRepository.addFavorite(userId, cafeId);

    return {
      isFavorite: true,
      cafeId,
    };
  },
};