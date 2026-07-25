import type { Request, Response } from "express";
import { adminDashboardService } from "../services/adminDashboard.service";

export const adminDashboardController = {
  getDashboardStats: async (_req: Request, res: Response) => {
    try {
      const stats = await adminDashboardService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get dashboard stats",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};