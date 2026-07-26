import { prisma } from "../config/prisma";

export const cafeImageRepository = {
  findCafeById: async (cafeId: number) => {
    return prisma.cafe.findUnique({
      where: {
        id: cafeId,
      },
    });
  },

  findImagesByCafeId: async (cafeId: number) => {
    return prisma.cafeImage.findMany({
      where: {
        cafeId,
      },
      orderBy: {
        id: "desc",
      },
    });
  },

  findImageById: async (imageId: number) => {
    return prisma.cafeImage.findUnique({
      where: {
        id: imageId,
      },
      include: {
        cafe: true,
      },
    });
  },

  createImages: async (cafeId: number, imageUrls: string[]) => {
    await prisma.cafeImage.createMany({
      data: imageUrls.map((imageUrl) => ({
        cafeId,
        imageUrl,
      })),
    });

    return prisma.cafeImage.findMany({
      where: {
        cafeId,
      },
      orderBy: {
        id: "desc",
      },
    });
  },

  deleteImage: async (imageId: number) => {
    return prisma.cafeImage.delete({
      where: {
        id: imageId,
      },
    });
  },

  setCafeCoverImage: async (cafeId: number, imageUrl: string | null) => {
    return prisma.cafe.update({
      where: {
        id: cafeId,
      },
      data: {
        coverImageUrl: imageUrl,
      },
    });
  },
};