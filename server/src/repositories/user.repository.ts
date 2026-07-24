import { prisma } from "../config/prisma";

export const userRepository = {
  findAll: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        provider: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  updateStatus: async (
    id: number,
    status: "ACTIVE" | "INACTIVE" | "BANNED"
  ) => {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        provider: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  },
};