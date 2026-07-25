import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
  userId: number;
  username?: string;
  email?: string;
  role: "USER" | "ADMIN";
};

export type AuthRequest = Request & {
  user?: AuthPayload;
};

const getTokenFromRequest = (req: Request) => {
  const authHeader = req.headers.authorization;

  return authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;
};

const verifyToken = (req: Request) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return null;
  }

  return jwt.verify(
    token,
    process.env.JWT_SECRET ?? "SmartCafeUbonSecret"
  ) as AuthPayload;
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const payload = verifyToken(req);

    if (payload) {
      req.user = payload;
    }

    next();
  } catch {
    next();
  }
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = verifyToken(req);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = verifyToken(req);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (payload.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};