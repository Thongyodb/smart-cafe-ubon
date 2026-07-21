import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: number;
  username?: string;
  email?: string;
  role: "USER" | "ADMIN";
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "SmartCafeUbonSecret"
    ) as JwtPayload;

    if (payload.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};