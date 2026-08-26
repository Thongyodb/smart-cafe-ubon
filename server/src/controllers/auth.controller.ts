import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { username, email, phone, password, confirmPassword } = req.body;

      if (!username || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Username, email, phone, password and confirm password are required",
        });
      }

      const result = await authService.register({
        username,
        email,
        phone,
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
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, phone and password are required",
        });
      }

      const result = await authService.login({
        identifier,
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