import { prisma } from "../config/prisma";

const activeCafeWhere = {
  isActive: true,
};

const activeCafeRelationWhere = {
  cafe: {
    is: {
      isActive: true,
    },
  },
};

export const adminDashboardRepository = {
  getStats: async () => {
    const [
      totalCafes,
      totalUsers,
      totalPhotoSpots,
      totalReviews,
      reviewsWithImages,
      reviewRatingSummary,
      cafeViewSummary,
      latestReviews,
      latestCafes,
      popularCafes,
    ] = await Promise.all([
      prisma.cafe.count({
        where: activeCafeWhere,
      }),

      prisma.user.count(),

      prisma.photoSpot.count({
        where: activeCafeRelationWhere,
      }),

      prisma.review.count({
        where: activeCafeRelationWhere,
      }),

      prisma.review.count({
        where: {
          ...activeCafeRelationWhere,
          images: {
            some: {},
          },
        },
      }),

      prisma.review.aggregate({
        where: activeCafeRelationWhere,
        _avg: {
          rating: true,
        },
      }),

      prisma.cafe.aggregate({
        where: activeCafeWhere,
        _sum: {
          totalViews: true,
        },
      }),

      prisma.review.findMany({
        take: 5,
        where: activeCafeRelationWhere,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          cafe: {
            select: {
              id: true,
              name: true,
              district: true,
            },
          },
          images: true,
        },
      }),

      prisma.cafe.findMany({
        take: 5,
        where: activeCafeWhere,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          district: true,
        },
      }),

      prisma.cafe.findMany({
        take: 5,
        where: activeCafeWhere,
        orderBy: {
          totalViews: "desc",
        },
        include: {
          category: true,
          district: true,
        },
      }),
    ]);

    return {
      totalCafes,
      totalUsers,
      totalPhotoSpots,
      totalReviews,
      reviewsWithImages,
      averageReviewRating: reviewRatingSummary._avg.rating
        ? Number(reviewRatingSummary._avg.rating.toFixed(1))
        : 0,
      totalViews: cafeViewSummary._sum.totalViews ?? 0,
      latestReviews,
      latestCafes,
      popularCafes,
    };
  },
};