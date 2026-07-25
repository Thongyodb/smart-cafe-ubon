import { prisma } from "../config/prisma";

const reviewInclude = {
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      avatarUrl: true,
    },
  },
  cafe: {
    select: {
      id: true,
      name: true,
      averageRating: true,
      totalReviews: true,
      district: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  images: true,
};

export const adminReviewRepository = {
  findAll: async (filters: {
    search?: string;
    rating?: number;
    cafeId?: number;
  }) => {
    return prisma.review.findMany({
      where: {
        ...(filters.rating
          ? {
              rating: filters.rating,
            }
          : {}),

        ...(filters.cafeId
          ? {
              cafeId: filters.cafeId,
            }
          : {}),

        ...(filters.search
          ? {
              OR: [
                {
                  comment: {
                    contains: filters.search,
                  },
                },
                {
                  user: {
                    fullName: {
                      contains: filters.search,
                    },
                  },
                },
                {
                  user: {
                    username: {
                      contains: filters.search,
                    },
                  },
                },
                {
                  cafe: {
                    name: {
                      contains: filters.search,
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: reviewInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findById: async (reviewId: number) => {
    return prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      include: reviewInclude,
    });
  },

  deleteReview: async (reviewId: number) => {
    return prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  },

  findReviewImageById: async (imageId: number) => {
    return prisma.reviewImage.findUnique({
      where: {
        id: imageId,
      },
      include: {
        review: true,
      },
    });
  },

  deleteReviewImage: async (imageId: number) => {
    return prisma.reviewImage.delete({
      where: {
        id: imageId,
      },
    });
  },

  findImagesByReviewId: async (reviewId: number) => {
    return prisma.reviewImage.findMany({
      where: {
        reviewId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  updateReviewMainImage: async (reviewId: number, imageUrl: string | null) => {
    return prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        imageUrl,
      },
    });
  },

  calculateCafeRating: async (cafeId: number) => {
    return prisma.review.aggregate({
      where: {
        cafeId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });
  },

  updateCafeRating: async (
    cafeId: number,
    averageRating: number,
    totalReviews: number
  ) => {
    return prisma.cafe.update({
      where: {
        id: cafeId,
      },
      data: {
        averageRating,
        totalReviews,
      },
    });
  },
};