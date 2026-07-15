import { axiosClient } from "../api/axiosClient";
import type { CafeDetailResponse, CafeListResponse } from "../types/cafe";

export type CafeQueryParams = {
  search?: string;
  categoryId?: number;
  districtId?: number;
  tagIds?: number[];
};

export type CreateCafePayload = {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  coverImageUrl?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  categoryId: number;
  districtId: number;
  tagIds: number[];
};

export const cafeService = {
  getCafes: async (params?: CafeQueryParams) => {
    const response = await axiosClient.get<CafeListResponse>("/cafes", {
      params: {
        search: params?.search,
        categoryId: params?.categoryId,
        districtId: params?.districtId,
        tagIds: params?.tagIds?.join(","),
      },
    });

    return response.data;
  },

  createCafe: async (data: CreateCafePayload) => {
    const response = await axiosClient.post<CafeDetailResponse>("/cafes", data);
    return response.data;
  },

  updateCafe: async (id: number, data: CreateCafePayload) => {
    const response = await axiosClient.put<CafeDetailResponse>(
      `/cafes/${id}`,
      data
    );

    return response.data;
  },

  deleteCafe: async (id: number) => {
    const response = await axiosClient.delete(`/cafes/${id}`);
    return response.data;
  },

  getNearbyCafes: async (lat: number, lng: number, radiusKm = 20) => {
    const response = await axiosClient.get<CafeListResponse>("/cafes/nearby", {
      params: {
        lat,
        lng,
        radiusKm,
      },
    });

    return response.data;
  },

  getCafeById: async (id: number) => {
    const response = await axiosClient.get<CafeDetailResponse>(`/cafes/${id}`);
    return response.data;
  },

  getTopRated: async () => {
    const response = await axiosClient.get<CafeListResponse>("/cafes/top-rated");
    return response.data;
  },

  getPopular: async () => {
    const response = await axiosClient.get<CafeListResponse>("/cafes/popular");
    return response.data;
  },

  getRandom: async () => {
    const response = await axiosClient.get<CafeDetailResponse>("/cafes/random");
    return response.data;
  },
};