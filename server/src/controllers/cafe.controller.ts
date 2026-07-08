import type { Request, Response } from "express";
import { cafeService } from "../services/cafe.service";

export const cafeController = {
  getCafes: async (req: Request, res: Response) => {
    try {
      const search = req.query.search?.toString();
      const categoryId = req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined;
      const districtId = req.query.districtId
        ? Number(req.query.districtId)
        : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const tagIds = req.query.tagIds
        ? req.query.tagIds
            .toString()
            .split(",")
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id))
        : undefined;

      const cafes = await cafeService.getCafes({
        search,
        categoryId,
        districtId,
        tagIds,
        limit,
      });

      res.json({
        success: true,
        count: cafes.length,
        data: cafes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get cafes",
      });
    }
  },

  getCafeById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cafe id",
        });
      }

      const cafe = await cafeService.getCafeById(id);

      res.json({
        success: true,
        data: cafe,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Cafe not found",
      });
    }
  },

  getTopRatedCafes: async (_req: Request, res: Response) => {
    try {
      const cafes = await cafeService.getTopRatedCafes();

      res.json({
        success: true,
        data: cafes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get top rated cafes",
      });
    }
  },

  getPopularCafes: async (_req: Request, res: Response) => {
    try {
      const cafes = await cafeService.getPopularCafes();

      res.json({
        success: true,
        data: cafes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get popular cafes",
      });
    }
  },

  getNearbyCafes: async (req: Request, res: Response) => {
    try {
      const lat = Number(req.query.lat);
      const lng = Number(req.query.lng);
      const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 20;

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const cafes = await cafeService.getNearbyCafes(lat, lng, radiusKm);

      res.json({
        success: true,
        count: cafes.length,
        data: cafes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get nearby cafes",
      });
    }
  },

  getRandomCafe: async (_req: Request, res: Response) => {
    try {
      const cafe = await cafeService.getRandomCafe();

      res.json({
        success: true,
        data: cafe,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "No cafe available",
      });
    }
  },
};