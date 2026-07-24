import { axiosClient } from "../api/axiosClient";
import type { Cafe } from "../types/cafe";

type FavoriteListResponse = {
  success: boolean;
  count: number;
  data: Cafe[];
};

type ToggleFavoriteResponse = {
  success: boolean;
  message: string;
  data: {
    isFavorite: boolean;
    cafeId: number;
  };
};

export const favoriteService = {
  getFavorites: async () => {
    const response = await axiosClient.get<FavoriteListResponse>("/favorites");
    return response.data;
  },

  toggleFavorite: async (cafeId: number) => {
    const response = await axiosClient.post<ToggleFavoriteResponse>(
      `/favorites/${cafeId}/toggle`
    );

    return response.data;
  },
};