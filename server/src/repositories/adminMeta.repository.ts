import { prisma } from "../config/prisma";

type TagType = "STYLE" | "COLOR" | "VIEW" | "TIME" | "FEATURE";

export const adminMetaRepository = {
  findCategories: async () => {
    return prisma.category.findMany({
      include: {
        _count: {
          select: {
            cafes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  createCategory: async (data: { name: string; description?: string | null }) => {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        _count: {
          select: {
            cafes: true,
          },
        },
      },
    });
  },

  updateCategory: async (
    id: number,
    data: { name: string; description?: string | null }
  ) => {
    return prisma.category.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        _count: {
          select: {
            cafes: true,
          },
        },
      },
    });
  },

  deleteCategory: async (id: number) => {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  },

  findCategoryById: async (id: number) => {
    return prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            cafes: true,
          },
        },
      },
    });
  },

  findTags: async () => {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: {
            cafeTags: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  createTag: async (data: { name: string; type: TagType }) => {
    return prisma.tag.create({
      data: {
        name: data.name,
        type: data.type,
      },
      include: {
        _count: {
          select: {
            cafeTags: true,
          },
        },
      },
    });
  },

  updateTag: async (id: number, data: { name: string; type: TagType }) => {
    return prisma.tag.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        type: data.type,
      },
      include: {
        _count: {
          select: {
            cafeTags: true,
          },
        },
      },
    });
  },

  deleteTag: async (id: number) => {
    return prisma.tag.delete({
      where: {
        id,
      },
    });
  },

  findTagById: async (id: number) => {
    return prisma.tag.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            cafeTags: true,
          },
        },
      },
    });
  },
};