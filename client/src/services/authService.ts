import { axiosClient } from "../api/axiosClient";
import { authStorage } from "../utils/authStorage";
import type { AuthUser } from "../utils/authStorage";

type RegisterPayload = {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export const authService = {
  register: async (payload: RegisterPayload) => {
    const response = await axiosClient.post<AuthResponse>(
      "/auth/register",
      payload
    );

    authStorage.setAuth(response.data.data.token, response.data.data.user);

    return response.data;
  },

  login: async (identifier: string, password: string) => {
    const response = await axiosClient.post<AuthResponse>("/auth/login", {
      identifier,
      password,
    });

    authStorage.setAuth(response.data.data.token, response.data.data.user);

    return response.data;
  },

  logout: () => {
    authStorage.logout();
  },
};