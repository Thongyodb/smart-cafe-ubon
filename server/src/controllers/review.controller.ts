import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { reviewService } from "../services/review.service";

const getImageUrlsFromRequest = (req: AuthRequest) => {
  const files = req.files as Express.Multer.File[] | undefined;

  return (
    files?.map(
      (file) => `http://localhost:5000/uploads/reviews/${file.filename}`
    ) ?? []
  );
};

export const reviewController = {
  getCafeReviews: async (req: AuthRequest, res: Response) => {
    try {
      const cafeId = Number(req.params.cafeId);

      if (Number.isNaN(cafeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cafe id",
        });
      }

      const reviews = await reviewService.getCafeReviews(cafeId);

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

  createReview: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const cafeId = Number(req.params.cafeId);
      const rating = Number(req.body.rating);
      const comment = req.body.comment;
      const imageUrls = getImageUrlsFromRequest(req);

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

      if (Number.isNaN(rating)) {
        return res.status(400).json({
          success: false,
          message: "Rating is required",
        });
      }

      const review = await reviewService.createReview(
        userId,
        cafeId,
        rating,
        comment,
        imageUrls
      );

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create review",
      });
    }
  },

  updateReview: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const reviewId = Number(req.params.reviewId);
      const rating = Number(req.body.rating);
      const comment = req.body.comment;
      const imageUrls = getImageUrlsFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (Number.isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review id",
        });
      }

      if (Number.isNaN(rating)) {
        return res.status(400).json({
          success: false,
          message: "Rating is required",
        });
      }

      const review = await reviewService.updateReview(
        userId,
        reviewId,
        rating,
        comment,
        imageUrls
      );

      res.json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update review",
      });
    }
  },

  deleteReview: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const reviewId = Number(req.params.reviewId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (Number.isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review id",
        });
      }

      const result = await reviewService.deleteReview(userId, reviewId);

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

  deleteReviewImage: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const imageId = Number(req.params.imageId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (Number.isNaN(imageId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review image id",
        });
      }

      const result = await reviewService.deleteReviewImage(userId, imageId);

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