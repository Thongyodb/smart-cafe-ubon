import { axiosClient } from "../api/axiosClient";
import type { AuthUser } from "../utils/authStorage";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type AdminUserItem = {
  id: number;
  username?: string | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarFocusX?: number;
  avatarFocusY?: number;
  avatarZoom?: number;
  provider: "LOCAL";
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

export type ProfileUser = AuthUser & {
  phone?: string | null;
  avatarFocusX?: number;
  avatarFocusY?: number;
  avatarZoom?: number;
};

export type UpdateProfilePayload = {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarFocusX?: number;
  avatarFocusY?: number;
  avatarZoom?: number;
};

type UserListResponse = {
  success: boolean;
  count: number;
  data: AdminUserItem[];
};

type UpdateUserStatusResponse = {
  success: boolean;
  message: string;
  data: AdminUserItem;
};

type ProfileResponse = {
  success: boolean;
  message?: string;
  data: ProfileUser;
};

type UpdateProfileData = UpdateProfilePayload | FormData;

const isFormData = (data: UpdateProfileData): data is FormData => {
  return data instanceof FormData;
};

export const userService = {
  getUsers: async () => {
    const response = await axiosClient.get<UserListResponse>("/users");

    return response.data;
  },

  updateUserStatus: async (id: number, status: UserStatus) => {
    const response = await axiosClient.patch<UpdateUserStatusResponse>(
      `/users/${id}/status`,
      {
        status,
      }
    );

    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get<ProfileResponse>("/users/me");

    return response.data;
  },

  updateMe: async (data: UpdateProfileData) => {
    const response = await axiosClient.put<ProfileResponse>(
      "/users/me",
      data,
      isFormData(data)
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );

    return response.data;
  },
};