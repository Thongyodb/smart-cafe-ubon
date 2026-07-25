import { axiosClient } from "../api/axiosClient";

export type DashboardReviewImage = {
  id: number;
  reviewId: number;
  imageUrl: string;
  createdAt: string;
};

export type DashboardReview = {
  id: number;
  userId: number;
  cafeId: number;
  rating: number;
  comment?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  user: {
    id: number;
    username?: string | null;
    fullName: string;
    avatarUrl?: string | null;
  };
  cafe: {
    id: number;
    name: string;
    district: {
      id: number;
      name: string;
    };
  };
  images?: DashboardReviewImage[];
};

export type DashboardCafe = {
  id: number;
  name: string;
  slug: string;
  coverImageUrl?: string | null;
  averageRating: number;
  totalReviews: number;
  totalViews: number;
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
  district: {
    id: number;
    name: string;
  };
};

export type AdminDashboardStats = {
  totalCafes: number;
  totalUsers: number;
  totalPhotoSpots: number;
  totalReviews: number;
  reviewsWithImages: number;
  averageReviewRating: number;
  totalViews: number;
  latestReviews: DashboardReview[];
  latestCafes: DashboardCafe[];
  popularCafes: DashboardCafe[];
};

type AdminDashboardResponse = {
  success: boolean;
  data: AdminDashboardStats;
};

export const adminDashboardService = {
  getStats: async () => {
    const response = await axiosClient.get<AdminDashboardResponse>(
      "/admin-dashboard"
    );

    return response.data;
  },
};