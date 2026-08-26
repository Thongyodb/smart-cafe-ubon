import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { recaptchaService } from "../services/recaptcha.service";

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const {
        username,
        email,
        phone,
        password,
        confirmPassword,
        recaptchaToken,
      } = req.body;

      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Please verify reCAPTCHA",
        });
      }

      const isRecaptchaValid = await recaptchaService.verify(
        recaptchaToken,
        req.ip
      );

      if (!isRecaptchaValid) {
        return res.status(400).json({
          success: false,
          message: "reCAPTCHA verification failed",
        });
      }

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
      const { identifier, password, recaptchaToken } = req.body;

      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Please verify reCAPTCHA",
        });
      }

      const isRecaptchaValid = await recaptchaService.verify(
        recaptchaToken,
        req.ip
      );

      if (!isRecaptchaValid) {
        return res.status(400).json({
          success: false,
          message: "reCAPTCHA verification failed",
        });
      }

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