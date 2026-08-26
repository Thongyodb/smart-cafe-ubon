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

  coverFocusX?: number | string | null;
  coverFocusY?: number | string | null;
  coverZoom?: number | string | null;

  priceMin?: number | null;
  priceMax?: number | null;
  categoryId: number;
  districtId: number;
  tagIds?: number[];
};

type UpdateCafeData = Partial<Omit<CreateCafeData, "slug">>;

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

const cafeDetailInclude = {
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
      images: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  cafeTags: {
    include: {
      tag: true,
    },
  },
};

const toNumberOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? undefined : numberValue;
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
      include: cafeInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 20,
    });
  },

  findById: async (id: number) => {
    return prisma.cafe.findUnique({
      where: {
        id,
      },
      include: cafeDetailInclude,
    });
  },

  findTopRated: async () => {
    return prisma.cafe.findMany({
      where: {
        isActive: true,
      },
      include: cafeInclude,
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
      include: cafeInclude,
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
      include: cafeInclude,
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

        coverFocusX: Number(data.coverFocusX ?? 50),
        coverFocusY: Number(data.coverFocusY ?? 50),
        coverZoom: Number(data.coverZoom ?? 1),

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
      include: cafeInclude,
    });
  },

  update: async (id: number, data: UpdateCafeData) => {
    const updateData: any = {
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
    };

    const coverFocusX = toNumberOrUndefined(data.coverFocusX);
    const coverFocusY = toNumberOrUndefined(data.coverFocusY);
    const coverZoom = toNumberOrUndefined(data.coverZoom);

    if (coverFocusX !== undefined) {
      updateData.coverFocusX = coverFocusX;
    }

    if (coverFocusY !== undefined) {
      updateData.coverFocusY = coverFocusY;
    }

    if (coverZoom !== undefined) {
      updateData.coverZoom = coverZoom;
    }

    await prisma.cafe.update({
      where: {
        id,
      },
      data: updateData,
    });

    /*
      สำคัญ:
      ลบ/สร้าง tag ใหม่ เฉพาะตอนที่ frontend ส่ง tagIds มาเท่านั้น
      ถ้าแค่อัปเดต coverFocusX/Y/Zoom จะไม่ลบ tag เดิมของร้าน
    */
    if (data.tagIds !== undefined) {
      await prisma.cafeTag.deleteMany({
        where: {
          cafeId: id,
        },
      });

      if (data.tagIds.length > 0) {
        await prisma.cafeTag.createMany({
          data: data.tagIds.map((tagId) => ({
            cafeId: id,
            tagId,
          })),
        });
      }
    }

    return prisma.cafe.findUnique({
      where: {
        id,
      },
      include: cafeInclude,
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
      include: cafeInclude,
    });

    if (cafes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * cafes.length);
    return cafes[randomIndex];
  },

  findVisitHistory: async (userId: number, cafeId: number) => {
    return prisma.visitHistory.findFirst({
      where: {
        userId,
        cafeId,
      },
    });
  },

  createVisitHistory: async (
    userId: number,
    cafeId: number,
    ipAddress?: string
  ) => {
    return prisma.visitHistory.create({
      data: {
        userId,
        cafeId,
        ipAddress,
      },
    });
  },

  increaseTotalViews: async (cafeId: number) => {
    return prisma.cafe.update({
      where: {
        id: cafeId,
      },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    });
  },
};