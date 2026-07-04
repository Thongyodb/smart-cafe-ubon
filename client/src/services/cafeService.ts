import { axiosClient } from "../api/axiosClient";
import type { CafeDetailResponse, CafeListResponse } from "../types/cafe";

export const cafeService = {
  getCafes: async (search?: string) => {
    const response = await axiosClient.get<CafeListResponse>("/cafes", {
      params: {
        search,
      },
    });

    return response.data;
  },

  getCafeById: async (id: number) => {
    const response = await axiosClient.get<CafeDetailResponse>(`/cafes/${id}`);

    return response.data;
  },

  getTopRated: async () => {
    const response = await axiosClient.get("/cafes/top-rated");

    return response.data;
  },

  getPopular: async () => {
    const response = await axiosClient.get("/cafes/popular");

    return response.data;
  },

  getRandom: async () => {
    const response = await axiosClient.get("/cafes/random");

    return response.data;
  },
};