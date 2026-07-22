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
};