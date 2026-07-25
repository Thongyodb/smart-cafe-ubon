import type { Request, Response } from "express";
import { adminReviewService } from "../services/adminReview.service";

export const adminReviewController = {
  getReviews: async (req: Request, res: Response) => {
    try {
      const search = req.query.search?.toString();
      const rating = req.query.rating ? Number(req.query.rating) : undefined;
      const cafeId = req.query.cafeId ? Number(req.query.cafeId) : undefined;

      const reviews = await adminReviewService.getReviews({
        search,
        rating: Number.isNaN(rating) ? undefined : rating,
        cafeId: Number.isNaN(cafeId) ? undefined : cafeId,
      });

      res.json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Failed to get reviews",
      });
    }
  },

  deleteReview: async (req: Request, res: Response) => {
    try {
      const reviewId = Number(req.params.reviewId);

      if (Number.isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review id",
        });
      }

      const result = await adminReviewService.deleteReview(reviewId);

      res.json({
        success: true,
        message: "Review deleted successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete review",
      });
    }
  },

  deleteReviewImage: async (req: Request, res: Response) => {
    try {
      const imageId = Number(req.params.imageId);

      if (Number.isNaN(imageId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review image id",
        });
      }

      const result = await adminReviewService.deleteReviewImage(imageId);

      res.json({
        success: true,
        message: "Review image deleted successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete review image",
      });
    }
  },
};