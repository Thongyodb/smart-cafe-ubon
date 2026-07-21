const AUTH_TOKEN_KEY = "smart_cafe_auth_token";
const AUTH_USER_KEY = "smart_cafe_auth_user";

export type AuthUser = {
  id: number;
  username?: string | null;
  fullName: string;
  email?: string | null;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
};

export const authStorage = {
  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser: () => {
    const userJson = localStorage.getItem(AUTH_USER_KEY);

    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  },

  isLoggedIn: () => {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  },

  isAdmin: () => {
    const user = authStorage.getUser();
    return user?.role === "ADMIN";
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};