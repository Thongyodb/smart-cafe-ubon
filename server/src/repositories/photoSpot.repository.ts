import { prisma } from "../config/prisma";

type CreatePhotoSpotData = {
  cafeId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  bestTime?: string | null;
  cameraAngle?: string | null;
};

export const photoSpotRepository = {
  findAll: async () => {
    return prisma.photoSpot.findMany({
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findById: async (id: number) => {
    return prisma.photoSpot.findUnique({
      where: {
        id,
      },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
    });
  },

  create: async (data: CreatePhotoSpotData) => {
    return prisma.photoSpot.create({
      data: {
        cafeId: data.cafeId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        bestTime: data.bestTime,
        cameraAngle: data.cameraAngle,
      },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
    });
  },

  update: async (id: number, data: CreatePhotoSpotData) => {
    return prisma.photoSpot.update({
      where: {
        id,
      },
      data: {
        cafeId: data.cafeId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        bestTime: data.bestTime,
        cameraAngle: data.cameraAngle,
      },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
      },
    });
  },

  delete: async (id: number) => {
    return prisma.photoSpot.delete({
      where: {
        id,
      },
    });
  },
};