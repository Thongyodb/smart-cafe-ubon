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

type PhotoSpotRequestData = PhotoSpotPayload | FormData;

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

const isFormData = (data: PhotoSpotRequestData): data is FormData => {
  return data instanceof FormData;
};

export const photoSpotService = {
  getPhotoSpots: async () => {
    const response = await axiosClient.get<PhotoSpotListResponse>(
      "/photo-spots"
    );

    return response.data;
  },

  createPhotoSpot: async (data: PhotoSpotRequestData) => {
    const response = await axiosClient.post<PhotoSpotDetailResponse>(
      "/photo-spots",
      data,
      isFormData(data)
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );

    return response.data;
  },

  updatePhotoSpot: async (id: number, data: PhotoSpotRequestData) => {
    const response = await axiosClient.put<PhotoSpotDetailResponse>(
      `/photo-spots/${id}`,
      data,
      isFormData(data)
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );

    return response.data;
  },

  deletePhotoSpot: async (id: number) => {
    const response = await axiosClient.delete(`/photo-spots/${id}`);

    return response.data;
  },
};