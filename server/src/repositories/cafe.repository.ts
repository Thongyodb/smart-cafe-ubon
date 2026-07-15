import { prisma } from "../config/prisma";

type CafeFilters = {
  search?: string;
  categoryId?: number;
  districtId?: number;
  tagIds?: number[];
  limit?: number;
};

type CreateCafeData = {
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  phone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  coverImageUrl?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  categoryId: number;
  districtId: number;
  tagIds?: number[];
};

type UpdateCafeData = Omit<CreateCafeData, "slug">;

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
        images: true,
        photoSpots: true,
        cafeTags: {
          include: {
            tag: true,
          },
        },
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
        images: true,
        photoSpots: true,
        cafeTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        totalViews: "desc",
      },
      take: 10,
    });
  },

  findActiveForNearby: async () => {
    return prisma.cafe.findMany({
      where: {
        isActive: true,
      },
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
    });
  },

  create: async (data: CreateCafeData) => {
    const cafe = await prisma.cafe.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openTime: data.openTime,
        closeTime: data.closeTime,
        phone: data.phone,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        websiteUrl: data.websiteUrl,
        coverImageUrl: data.coverImageUrl,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        categoryId: data.categoryId,
        districtId: data.districtId,
      },
    });

    if (data.tagIds && data.tagIds.length > 0) {
      await prisma.cafeTag.createMany({
        data: data.tagIds.map((tagId) => ({
          cafeId: cafe.id,
          tagId,
        })),
      });
    }

    return prisma.cafe.findUnique({
      where: {
        id: cafe.id,
      },
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
    });
  },

  update: async (id: number, data: UpdateCafeData) => {
    await prisma.cafe.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openTime: data.openTime,
        closeTime: data.closeTime,
        phone: data.phone,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        websiteUrl: data.websiteUrl,
        coverImageUrl: data.coverImageUrl,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        categoryId: data.categoryId,
        districtId: data.districtId,
      },
    });

    await prisma.cafeTag.deleteMany({
      where: {
        cafeId: id,
      },
    });

    if (data.tagIds && data.tagIds.length > 0) {
      await prisma.cafeTag.createMany({
        data: data.tagIds.map((tagId) => ({
          cafeId: id,
          tagId,
        })),
      });
    }

    return prisma.cafe.findUnique({
      where: {
        id,
      },
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
    });
  },

  deactivate: async (id: number) => {
    return prisma.cafe.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
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
        images: true,
        photoSpots: true,
        cafeTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (cafes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * cafes.length);
    return cafes[randomIndex];
  },
};