import { prisma } from "../config/prisma";

type CafeFilters = {
  search?: string;
  categoryId?: number;
  districtId?: number;
  tagIds?: number[];
  limit?: number;
};

export const cafeRepository = {
  findAll: async (filters: CafeFilters) => {
    const where = {
      isActive: true,
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } },
          { address: { contains: filters.search } },
        ],
      }),
      ...(filters.categoryId && {
        categoryId: filters.categoryId,
      }),
      ...(filters.districtId && {
        districtId: filters.districtId,
      }),
      ...(filters.tagIds &&
        filters.tagIds.length > 0 && {
          cafeTags: {
            some: {
              tagId: {
                in: filters.tagIds,
              },
            },
          },
        }),
    };

    return prisma.cafe.findMany({
      where,
      include: {
        category: true,
        district: true,
        images: true,
        photoSpots: true,
        cafeTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 20,
    });
  },

  findById: async (id: number) => {
    return prisma.cafe.findUnique({
      where: { id },
      include: {
        category: true,
        district: true,
        images: true,
        photoSpots: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        cafeTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },

  findTopRated: async () => {
    return prisma.cafe.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        district: true,
      },
      orderBy: [
        {
          averageRating: "desc",
        },
        {
          totalReviews: "desc",
        },
      ],
      take: 10,
    });
  },

  findPopular: async () => {
    return prisma.cafe.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        district: true,
      },
      orderBy: {
        totalViews: "desc",
      },
      take: 10,
    });
  },

  findRandom: async () => {
    const cafes = await prisma.cafe.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        district: true,
      },
    });

    if (cafes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * cafes.length);
    return cafes[randomIndex];
  },
};