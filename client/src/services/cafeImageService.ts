import { axiosClient } from "../api/axiosClient";

export type CafeImageItem = {
  id: number;
  cafeId: number;
  imageUrl: string;
  createdAt: string;
};

type CafeImagesResponse = {
  success: boolean;
  count: number;
  data: CafeImageItem[];
};

type UploadCafeImagesResponse = {
  success: boolean;
  message: string;
  count: number;
  data: CafeImageItem[];
};

type BasicResponse = {
  success: boolean;
  message: string;
};

export const cafeImageService = {
  getCafeImages: async (cafeId: number) => {
    const response = await axiosClient.get<CafeImagesResponse>(
      `/cafe-images/${cafeId}`
    );

    return response.data;
  },

  uploadCafeImages: async (cafeId: number, files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axiosClient.post<UploadCafeImagesResponse>(
      `/cafe-images/${cafeId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  deleteCafeImage: async (imageId: number) => {
    const response = await axiosClient.delete<BasicResponse>(
      `/cafe-images/${imageId}`
    );

    return response.data;
  },

  setCoverImage: async (imageId: number) => {
    const response = await axiosClient.patch<BasicResponse>(
      `/cafe-images/${imageId}/cover`
    );

    return response.data;
  },
};