import { axiosClient } from "../api/axiosClient";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type AdminUserItem = {
  id: number;
  username?: string | null;
  fullName: string;
  email?: string | null;
  avatarUrl?: string | null;
  provider: "LOCAL" | "GOOGLE" | "FACEBOOK" | "INSTAGRAM";
  role: "USER" | "ADMIN";
  status: UserStatus;
  createdAt: string;
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
};