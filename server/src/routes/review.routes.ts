import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/auth.middleware";
import { reviewController } from "../controllers/review.controller";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, "uploads/reviews");
  },

  filename: (_req, file, callback) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000
    )}${path.extname(file.originalname)}`;

    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }

    callback(null, true);
  },
});

router.get("/cafes/:cafeId/reviews", reviewController.getCafeReviews);

router.post(
  "/cafes/:cafeId/reviews",
  requireAuth,
  upload.array("images", 5),
  reviewController.createReview
);

router.put(
  "/reviews/:reviewId",
  requireAuth,
  upload.array("images", 5),
  reviewController.updateReview
);

router.delete("/reviews/:reviewId", requireAuth, reviewController.deleteReview);

router.delete(
  "/review-images/:imageId",
  requireAuth,
  reviewController.deleteReviewImage
);

export default router;