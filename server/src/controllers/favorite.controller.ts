import type { Response } from "express";
import { favoriteService } from "../services/favorite.service";
import type { AuthRequest } from "../middleware/auth.middleware";

export const favoriteController = {
  getFavorites: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cafes = await favoriteService.getFavorites(userId);

      res.json({
        success: true,
        count: cafes.length,
        data: cafes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get favorites",
      });
    }
  },

  toggleFavorite: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const cafeId = Number(req.params.cafeId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (Number.isNaN(cafeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cafe id",
        });
      }

      const result = await favoriteService.toggleFavorite(userId, cafeId);

      res.json({
        success: true,
        message: result.isFavorite
          ? "Added to favorites"
          : "Removed from favorites",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update favorite",
      });
    }
  },
};