import { axiosClient } from "../api/axiosClient";

export type PhotoSpotItem = {
  id: number;
  cafeId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  bestTime?: string | null;
  cameraAngle?: string | null;
  createdAt: string;
  cafe: {
    id: number;
    name: string;
    district: {
      id: number;
      name: string;
    };
  };
};

export type PhotoSpotPayload = {
  cafeId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  bestTime?: string;
  cameraAngle?: string;
};

type PhotoSpotListResponse = {
  success: boolean;
  count: number;
  data: PhotoSpotItem[];
};

type PhotoSpotDetailResponse = {
  success: boolean;
  message?: string;
  data: PhotoSpotItem;
};

export const photoSpotService = {
  getPhotoSpots: async () => {
    const response = await axiosClient.get<PhotoSpotListResponse>(
      "/photo-spots"
    );

    return response.data;
  },

  createPhotoSpot: async (data: PhotoSpotPayload) => {
    const response = await axiosClient.post<PhotoSpotDetailResponse>(
      "/photo-spots",
      data
    );

    return response.data;
  },

  updatePhotoSpot: async (id: number, data: PhotoSpotPayload) => {
    const response = await axiosClient.put<PhotoSpotDetailResponse>(
      `/photo-spots/${id}`,
      data
    );

    return response.data;
  },

  deletePhotoSpot: async (id: number) => {
    const response = await axiosClient.delete(`/photo-spots/${id}`);
    return response.data;
  },
};