const AUTH_TOKEN_KEY = "smart_cafe_auth_token";
const AUTH_USER_KEY = "smart_cafe_auth_user";
export const AUTH_CHANGE_EVENT = "smart-cafe-auth-change";

export type AuthUser = {
  id: number;
  username?: string | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  avatarUrl?: string | null;
  avatarFocusX?: number;
  avatarFocusY?: number;
  avatarZoom?: number;
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const authStorage = {
  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    notifyAuthChange();
  },

  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser: (): AuthUser | null => {
    const userText = localStorage.getItem(AUTH_USER_KEY);

    if (!userText) {
      return null;
    }

    try {
      return JSON.parse(userText) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      notifyAuthChange();
      return null;
    }
  },

  isLoggedIn: () => {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  },

  isAdmin: () => {
    const userText = localStorage.getItem(AUTH_USER_KEY);

    if (!userText) {
      return false;
    }

    try {
      const user = JSON.parse(userText) as AuthUser;
      return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    notifyAuthChange();
  },
};