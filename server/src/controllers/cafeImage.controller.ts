import type { Request, Response } from "express";
import { cafeImageService } from "../services/cafeImage.service";

const getImageUrlsFromRequest = (req: Request) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return [];
  }

  return files.map((file) => {
    return `${req.protocol}://${req.get("host")}/uploads/cafes/${file.filename}`;
  });
};

export const cafeImageController = {
  getCafeImages: async (req: Request, res: Response) => {
    try {
      const cafeId = Number(req.params.cafeId);

      if (Number.isNaN(cafeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cafe id",
        });
      }

      const images = await cafeImageService.getCafeImages(cafeId);

      res.json({
        success: true,
        count: images.length,
        data: images,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Cafe images not found",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  uploadCafeImages: async (req: Request, res: Response) => {
    try {
      const cafeId = Number(req.params.cafeId);

      if (Number.isNaN(cafeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cafe id",
        });
      }

      const imageUrls = getImageUrlsFromRequest(req);
      const images = await cafeImageService.uploadCafeImages(cafeId, imageUrls);

      res.status(201).json({
        success: true,
        message: "Cafe images uploaded successfully",
        count: images.length,
        data: images,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to upload cafe images",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  deleteCafeImage: async (req: Request, res: Response) => {
    try {
      const imageId = Number(req.params.imageId);

      if (Number.isNaN(imageId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image id",
        });
      }

      const result = await cafeImageService.deleteCafeImage(imageId);

      res.json({
        success: true,
        message: "Cafe image deleted successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete cafe image",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  setCoverImage: async (req: Request, res: Response) => {
    try {
      const imageId = Number(req.params.imageId);

      if (Number.isNaN(imageId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image id",
        });
      }

      const cafe = await cafeImageService.setCoverImage(imageId);

      res.json({
        success: true,
        message: "Cafe cover image updated successfully",
        data: cafe,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to set cover image",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};