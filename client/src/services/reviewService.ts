import { axiosClient } from "../api/axiosClient";

export type ReviewUser = {
  id: number;
  username?: string | null;
  fullName: string;
  avatarUrl?: string | null;
};

export type ReviewImage = {
  id: number;
  reviewId: number;
  imageUrl: string;
  createdAt: string;
};

export type ReviewItem = {
  id: number;
  userId: number;
  cafeId: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  images?: ReviewImage[];
};

type ReviewListResponse = {
  success: boolean;
  count: number;
  data: ReviewItem[];
};

type ReviewResponse = {
  success: boolean;
  message: string;
  data: ReviewItem;
};

type ReviewPayload = {
  rating: number;
  comment: string;
  images?: File[];
};

const buildReviewFormData = (data: ReviewPayload) => {
  const formData = new FormData();

  formData.append("rating", String(data.rating));
  formData.append("comment", data.comment);

  data.images?.forEach((image) => {
    formData.append("images", image);
  });

  return formData;
};

export const reviewService = {
  getCafeReviews: async (cafeId: number) => {
    const response = await axiosClient.get<ReviewListResponse>(
      `/cafes/${cafeId}/reviews`
    );

    return response.data;
  },

  createReview: async (cafeId: number, data: ReviewPayload) => {
    const formData = buildReviewFormData(data);

    const response = await axiosClient.post<ReviewResponse>(
      `/cafes/${cafeId}/reviews`,
      formData
    );

    return response.data;
  },

  updateReview: async (reviewId: number, data: ReviewPayload) => {
    const formData = buildReviewFormData(data);

    const response = await axiosClient.put<ReviewResponse>(
      `/reviews/${reviewId}`,
      formData
    );

    return response.data;
  },

  deleteReview: async (reviewId: number) => {
    const response = await axiosClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};