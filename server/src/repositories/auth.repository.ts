import { prisma } from "../config/prisma";

export const authRepository = {
  findUserByUsername: async (username: string) => {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  },

  createLocalUser: async (data: {
    username: string;
    fullName: string;
    password: string;
  }) => {
    return prisma.user.create({
      data: {
        username: data.username,
        fullName: data.fullName,
        password: data.password,
        provider: "LOCAL",
        role: "USER",
        status: "ACTIVE",
      },
    });
  },
};