import type { Request, Response } from "express";
import { photoSpotService } from "../services/photoSpot.service";

const getUploadedImageUrl = (req: Request) => {
  const file = req.file;

  if (!file) {
    return "";
  }

  return `/uploads/photo-spots/${file.filename}`;
};

export const photoSpotController = {
  getPhotoSpots: async (_req: Request, res: Response) => {
    try {
      const photoSpots = await photoSpotService.getPhotoSpots();

      res.json({
        success: true,
        count: photoSpots.length,
        data: photoSpots,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get photo spots",
      });
    }
  },

  getPhotoSpotById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid photo spot id",
        });
      }

      const photoSpot = await photoSpotService.getPhotoSpotById(id);

      res.json({
        success: true,
        data: photoSpot,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Photo spot not found",
      });
    }
  },

  createPhotoSpot: async (req: Request, res: Response) => {
    try {
      const { cafeId, name, description, imageUrl, bestTime, cameraAngle } =
        req.body;

      if (!cafeId || !name) {
        return res.status(400).json({
          success: false,
          message: "Cafe and photo spot name are required",
        });
      }

      const uploadedImageUrl = getUploadedImageUrl(req);

      const photoSpot = await photoSpotService.createPhotoSpot({
        cafeId: Number(cafeId),
        name,
        description,
        imageUrl: uploadedImageUrl || imageUrl || "",
        bestTime,
        cameraAngle,
      });

      res.status(201).json({
        success: true,
        message: "Photo spot created successfully",
        data: photoSpot,
      });
    } catch (error) {
      console.error("CREATE PHOTO SPOT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create photo spot",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  updatePhotoSpot: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid photo spot id",
        });
      }

      const { cafeId, name, description, imageUrl, bestTime, cameraAngle } =
        req.body;

      if (!cafeId || !name) {
        return res.status(400).json({
          success: false,
          message: "Cafe and photo spot name are required",
        });
      }

      const uploadedImageUrl = getUploadedImageUrl(req);

      const photoSpot = await photoSpotService.updatePhotoSpot(id, {
        cafeId: Number(cafeId),
        name,
        description,
        imageUrl: uploadedImageUrl || imageUrl || "",
        bestTime,
        cameraAngle,
      });

      res.json({
        success: true,
        message: "Photo spot updated successfully",
        data: photoSpot,
      });
    } catch (error) {
      console.error("UPDATE PHOTO SPOT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update photo spot",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  deletePhotoSpot: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid photo spot id",
        });
      }

      await photoSpotService.deletePhotoSpot(id);

      res.json({
        success: true,
        message: "Photo spot deleted successfully",
      });
    } catch (error) {
      console.error("DELETE PHOTO SPOT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete photo spot",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};