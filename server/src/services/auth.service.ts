import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";

type RegisterParams = {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type LoginParams = {
  identifier: string;
  password: string;
};

const createToken = (user: {
  id: number;
  username: string | null;
  email: string | null;
  phone: string | null;
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
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  avatarFocusX: number;
  avatarFocusY: number;
  avatarZoom: number;
}) => {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    avatarFocusX: user.avatarFocusX,
    avatarFocusY: user.avatarFocusY,
    avatarZoom: user.avatarZoom,
  };
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string) => {
  return /^[0-9]{9,10}$/.test(phone);
};

export const authService = {
  register: async ({
    username,
    email,
    phone,
    password,
    confirmPassword,
  }: RegisterParams) => {
    const cleanedUsername = username.trim();
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPhone = phone.trim().replace(/[-\s]/g, "");

    if (cleanedUsername.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }

    if (!validateEmail(cleanedEmail)) {
      throw new Error("Invalid email format");
    }

    if (!validatePhone(cleanedPhone)) {
      throw new Error("Invalid phone number");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      throw new Error("Password and confirm password do not match");
    }

    const existingUsername = await authRepository.findUserByUsername(
      cleanedUsername
    );

    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const existingEmail = await authRepository.findUserByEmail(cleanedEmail);

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const existingPhone = await authRepository.findUserByPhone(cleanedPhone);

    if (existingPhone) {
      throw new Error("Phone number already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.createLocalUser({
      username: cleanedUsername,
      email: cleanedEmail,
      phone: cleanedPhone,
      fullName: cleanedUsername,
      password: hashedPassword,
    });

    const token = createToken(user);

    return {
      token,
      user: toAuthUser(user),
    };
  },

  login: async ({ identifier, password }: LoginParams) => {
    const cleanedIdentifier = identifier.trim();

    if (!cleanedIdentifier || !password) {
      throw new Error("Identifier and password are required");
    }

    const user = await authRepository.findUserByIdentifier(cleanedIdentifier);

    if (!user || !user.password) {
      throw new Error("Invalid username, email, phone or password");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("User account is not active");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid username, email, phone or password");
    }

    const token = createToken(user);

    return {
      token,
      user: toAuthUser(user),
    };
  },
};