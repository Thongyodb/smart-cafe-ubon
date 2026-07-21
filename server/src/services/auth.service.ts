import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";

type RegisterParams = {
  username: string;
  password: string;
  confirmPassword: string;
};

type LoginParams = {
  username: string;
  password: string;
};

const createToken = (user: {
  id: number;
  username: string | null;
  email: string | null;
  role: string;
}) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET ?? "SmartCafeUbonSecret",
    {
      expiresIn: "1d",
    }
  );
};

const toAuthUser = (user: {
  id: number;
  username: string | null;
  fullName: string;
  email: string | null;
  role: string;
  avatarUrl: string | null;
}) => {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
};

export const authService = {
  register: async ({ username, password, confirmPassword }: RegisterParams) => {
    const cleanedUsername = username.trim();

    if (cleanedUsername.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      throw new Error("Password and confirm password do not match");
    }

    const existingUser = await authRepository.findUserByUsername(
      cleanedUsername
    );

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.createLocalUser({
      username: cleanedUsername,
      fullName: cleanedUsername,
      password: hashedPassword,
    });

    const token = createToken(user);

    return {
      token,
      user: toAuthUser(user),
    };
  },

  login: async ({ username, password }: LoginParams) => {
    const user = await authRepository.findUserByUsername(username.trim());

    if (!user || !user.password) {
      throw new Error("Invalid username or password");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("User account is not active");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    const token = createToken(user);

    return {
      token,
      user: toAuthUser(user),
    };
  },
};