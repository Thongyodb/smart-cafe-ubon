import { prisma } from "../config/prisma";

export const authRepository = {
  findUserByUsername: async (username: string) => {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  },

  findUserByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  findUserByPhone: async (phone: string) => {
    return prisma.user.findFirst({
      where: {
        phone,
      },
    });
  },

  findUserByIdentifier: async (identifier: string) => {
    const cleanedIdentifier = identifier.trim();
    const cleanedPhone = cleanedIdentifier.replace(/[-\s]/g, "");

    return prisma.user.findFirst({
      where: {
        OR: [
          {
            username: cleanedIdentifier,
          },
          {
            email: cleanedIdentifier.toLowerCase(),
          },
          {
            phone: cleanedPhone,
          },
        ],
      },
    });
  },

  createLocalUser: async (data: {
    username: string;
    email: string;
    phone: string;
    fullName: string;
    password: string;
  }) => {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        password: data.password,
        provider: "LOCAL",
        role: "USER",
        status: "ACTIVE",
      },
    });
  },
};