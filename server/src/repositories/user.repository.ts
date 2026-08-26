import { prisma } from "../config/prisma";

export type UpdateProfileData = {
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl?: string | null;
  avatarFocusX?: number;
  avatarFocusY?: number;
  avatarZoom?: number;
};

const userSelect = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  avatarFocusX: true,
  avatarFocusY: true,
  avatarZoom: true,
  provider: true,
  role: true,
  status: true,
  createdAt: true,
};

export const userRepository = {
  findAll: async () => {
    return prisma.user.findMany({
      select: userSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findById: async (id: number) => {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: userSelect,
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findFirst({
      where: {
        email,
      },
      select: userSelect,
    });
  },

  findByPhone: async (phone: string) => {
    return prisma.user.findFirst({
      where: {
        phone,
      },
      select: userSelect,
    });
  },

  updateProfile: async (id: number, data: UpdateProfileData) => {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        avatarFocusX: data.avatarFocusX,
        avatarFocusY: data.avatarFocusY,
        avatarZoom: data.avatarZoom,
      },
      select: userSelect,
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
      select: userSelect,
    });
  },
};