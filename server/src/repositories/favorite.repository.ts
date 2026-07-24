import { prisma } from "../config/prisma";

const cafeInclude = {
  category: true,
  district: true,
  images: true,
  photoSpots: true,
  cafeTags: {
    include: {
      tag: true,
    },
  },
};

export const favoriteRepository = {
  findUserFavorites: async (userId: number) => {
    return prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        cafe: {
          include: cafeInclude,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findFavorite: async (userId: number, cafeId: number) => {
    return prisma.favorite.findUnique({
      where: {
        userId_cafeId: {
          userId,
          cafeId,
        },
      },
    });
  },

  addFavorite: async (userId: number, cafeId: number) => {
    return prisma.favorite.create({
      data: {
        userId,
        cafeId,
      },
      include: {
        cafe: {
          include: cafeInclude,
        },
      },
    });
  },

  removeFavorite: async (userId: number, cafeId: number) => {
    return prisma.favorite.delete({
      where: {
        userId_cafeId: {
          userId,
          cafeId,
        },
      },
    });
  },
};