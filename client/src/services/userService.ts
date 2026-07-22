import { axiosClient } from "../api/axiosClient";

export type AdminUserItem = {
  id: number;
  username?: string | null;
  fullName: string;
  email?: string | null;
  avatarUrl?: string | null;
  provider: "LOCAL" | "GOOGLE" | "FACEBOOK" | "INSTAGRAM";
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  createdAt: string;
};

type UserListResponse = {
  success: boolean;
  count: number;
  data: AdminUserItem[];
};

export const userService = {
  getUsers: async () => {
    const response = await axiosClient.get<UserListResponse>("/users");
    return response.data;
  },
};