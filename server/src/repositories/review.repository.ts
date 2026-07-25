import { prisma } from "../config/prisma";

const reviewInclude = {
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
    },
  },
  images: true,
};

export const reviewRepository = {
  findByCafeId: async (cafeId: number) => {
    return prisma.review.findMany({
      where: {
        cafeId,
      },
      include: reviewInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findUserReview: async (userId: number, cafeId: number) => {
    return prisma.review.findFirst({
      where: {
        userId,
        cafeId,
      },
      include: reviewInclude,
    });
  },

  create: async (data: {
    userId: number;
    cafeId: number;
    rating: number;
    comment?: string | null;
    imageUrls?: string[];
  }) => {
    const reviewData: any = {
      userId: data.userId,
      cafeId: data.cafeId,
      rating: data.rating,
      comment: data.comment,
    };

    if (data.imageUrls && data.imageUrls.length > 0) {
      reviewData.imageUrl = data.imageUrls[0];
      reviewData.images = {
        create: data.imageUrls.map((imageUrl) => ({
          imageUrl,
        })),
      };
    }

    return prisma.review.create({
      data: reviewData,
      include: reviewInclude,
    });
  },

  update: async (
    id: number,
    data: {
      rating: number;
      comment?: string | null;
      imageUrls?: string[];
    }
  ) => {
    const reviewData: any = {
      rating: data.rating,
      comment: data.comment,
    };

    if (data.imageUrls && data.imageUrls.length > 0) {
      reviewData.imageUrl = data.imageUrls[0];
      reviewData.images = {
        create: data.imageUrls.map((imageUrl) => ({
          imageUrl,
        })),
      };
    }

    return prisma.review.update({
      where: {
        id,
      },
      data: reviewData,
      include: reviewInclude,
    });
  },

  delete: async (id: number) => {
    return prisma.review.delete({
      where: {
        id,
      },
    });
  },

  findById: async (id: number) => {
    return prisma.review.findUnique({
      where: {
        id,
      },
      include: reviewInclude,
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