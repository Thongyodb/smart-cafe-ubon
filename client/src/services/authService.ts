import { axiosClient } from "../api/axiosClient";
import { authStorage } from "../utils/authStorage";
import type { AuthUser } from "../utils/authStorage";

type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export const authService = {
  register: async (
    username: string,
    password: string,
    confirmPassword: string
  ) => {
    const response = await axiosClient.post<AuthResponse>("/auth/register", {
      username,
      password,
      confirmPassword,
    });

    authStorage.setAuth(response.data.data.token, response.data.data.user);

    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await axiosClient.post<AuthResponse>("/auth/login", {
      username,
      password,
    });

    authStorage.setAuth(response.data.data.token, response.data.data.user);

    return response.data;
  },

  logout: () => {
    authStorage.logout();
  },
};