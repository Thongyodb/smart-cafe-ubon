import type { Request, Response } from "express";
import { userService } from "../services/user.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId?: number;
    id?: number;
    role?: string;
  };
  file?: Express.Multer.File;
};

const getCurrentUserId = (req: AuthenticatedRequest) => {
  return req.user?.userId ?? req.user?.id;
};

const getUploadedAvatarUrl = (req: AuthenticatedRequest) => {
  const file = req.file;

  if (!file) {
    return "";
  }

  return `/uploads/avatars/${file.filename}`;
};

export const userController = {
  getMe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getCurrentUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get profile",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getCurrentUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        fullName,
        email,
        phone,
        avatarUrl,
        avatarFocusX,
        avatarFocusY,
        avatarZoom,
      } = req.body;

      if (!fullName || !String(fullName).trim()) {
        return res.status(400).json({
          success: false,
          message: "Full name is required",
        });
      }

      const uploadedAvatarUrl = getUploadedAvatarUrl(req);

      const user = await userService.updateMyProfile(userId, {
        fullName: String(fullName).trim(),
        email: email ? String(email).trim() : null,
        phone: phone ? String(phone).trim() : null,
        avatarUrl: uploadedAvatarUrl || avatarUrl || null,
        avatarFocusX: avatarFocusX !== undefined ? Number(avatarFocusX) : 50,
        avatarFocusY: avatarFocusY !== undefined ? Number(avatarFocusY) : 50,
        avatarZoom: avatarZoom !== undefined ? Number(avatarZoom) : 1,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  getUsers: async (_req: Request, res: Response) => {
    try {
      const users = await userService.getUsers();

      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get users",
      });
    }
  },

  updateUserStatus: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      if (!["ACTIVE", "INACTIVE", "BANNED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user status",
        });
      }

      const user = await userService.updateUserStatus(id, status);

      res.json({
        success: true,
        message: "User status updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update user status",
      });
    }
  },
};