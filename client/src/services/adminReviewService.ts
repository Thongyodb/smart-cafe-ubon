import { axiosClient } from "../api/axiosClient";

export type AdminReviewImage = {
  id: number;
  reviewId: number;
  imageUrl: string;
  createdAt: string;
};

export type AdminReviewItem = {
  id: number;
  userId: number;
  cafeId: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username?: string | null;
    fullName: string;
    email?: string | null;
    avatarUrl?: string | null;
    avatarFocusX?: number;
    avatarFocusY?: number;
    avatarZoom?: number;
  };
  cafe: {
    id: number;
    name: string;
    averageRating: number;
    totalReviews: number;
    district: {
      id: number;
      name: string;
    };
  };
  images?: AdminReviewImage[];
};

type AdminReviewListResponse = {
  success: boolean;
  count: number;
  data: AdminReviewItem[];
};

type DeleteReviewResponse = {
  success: boolean;
  message: string;
  data: {
    reviewId: number;
    cafeId: number;
  };
};

type DeleteReviewImageResponse = {
  success: boolean;
  message: string;
  data: {
    imageId: number;
    reviewId: number;
    imageUrl: string;
  };
};

export const adminReviewService = {
  getReviews: async (params?: {
    search?: string;
    rating?: number;
    cafeId?: number;
  }) => {
    const response = await axiosClient.get<AdminReviewListResponse>(
      "/admin-reviews",
      {
        params,
      }
    );

    return response.data;
  },

  deleteReview: async (reviewId: number) => {
    const response = await axiosClient.delete<DeleteReviewResponse>(
      `/admin-reviews/${reviewId}`
    );

    return response.data;
  },

  deleteReviewImage: async (imageId: number) => {
    const response = await axiosClient.delete<DeleteReviewImageResponse>(
      `/admin-reviews/images/${imageId}`
    );

    return response.data;
  },
};