import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { username, password, confirmPassword } = req.body;

      if (!username || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Username, password and confirm password are required",
        });
      }

      const result = await authService.register({
        username,
        password,
        confirmPassword,
      });

      res.status(201).json({
        success: true,
        message: "Register successful",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Register failed",
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      const result = await authService.login({
        username,
        password,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  },
};