import type { Request, Response } from "express";
import { metaService } from "../services/meta.service";

export const metaController = {
  getFilters: async (_req: Request, res: Response) => {
    try {
      const filters = await metaService.getFilters();

      res.json({
        success: true,
        data: filters,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get filter data",
      });
    }
  },
};