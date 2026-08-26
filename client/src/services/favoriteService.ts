import { axiosClient } from "../api/axiosClient";
import type { Cafe } from "../types/cafe";

export type FavoriteItem = Cafe & {
  cafeId?: number;
  cafe?: Cafe;
};

type FavoriteListResponse = {
  success: boolean;
  count?: number;
  data: FavoriteItem[];
};

type ToggleFavoriteResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  isFavorite?: boolean;
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