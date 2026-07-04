import { prisma } from "../config/prisma";

export const metaRepository = {
  getFilters: async () => {
    const [categories, districts, tags] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.district.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
    ]);

    return {
      categories,
      districts,
      tags,
    };
  },
};