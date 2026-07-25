import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import { adminReviewController } from "../controllers/adminReview.controller";

const router = Router();

router.get("/", requireAdmin, adminReviewController.getReviews);
router.delete("/:reviewId", requireAdmin, adminReviewController.deleteReview);

router.delete(
  "/images/:imageId",
  requireAdmin,
  adminReviewController.deleteReviewImage
);

export default router;