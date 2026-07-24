import type { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
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