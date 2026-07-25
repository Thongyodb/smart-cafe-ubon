import fs from "fs/promises";
import path from "path";
import { adminReviewRepository } from "../repositories/adminReview.repository";

const deleteLocalReviewImageFile = async (imageUrl: string) => {
  try {
    const parsedUrl = new URL(imageUrl);
    const filename = path.basename(parsedUrl.pathname);

    if (!filename) {
      return;
    }

    const filePath = path.join(process.cwd(), "uploads", "reviews", filename);
    await fs.unlink(filePath).catch(() => undefined);
  } catch {
    const filename = path.basename(imageUrl);

    if (!filename) {
      return;
    }

    const filePath = path.join(process.cwd(), "uploads", "reviews", filename);
    await fs.unlink(filePath).catch(() => undefined);
  }
};

const updateCafeRatingSummary = async (cafeId: number) => {
  const summary = await adminReviewRepository.calculateCafeRating(cafeId);

  const averageRating = summary._avg.rating
    ? Number(summary._avg.rating.toFixed(1))
    : 0;

  const totalReviews = summary._count.rating;

  await adminReviewRepository.updateCafeRating(
    cafeId,
    averageRating,
    totalReviews
  );
};

export const adminReviewService = {
  getReviews: async (filters: {
    search?: string;
    rating?: number;
    cafeId?: number;
  }) => {
    return adminReviewRepository.findAll(filters);
  },

  deleteReview: async (reviewId: number) => {
    const review = await adminReviewRepository.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    await Promise.all(
      (review.images ?? []).map((image) =>
        deleteLocalReviewImageFile(image.imageUrl)
      )
    );

    await adminReviewRepository.deleteReview(reviewId);
    await updateCafeRatingSummary(review.cafeId);

    return {
      reviewId,
      cafeId: review.cafeId,
    };
  },

  deleteReviewImage: async (imageId: number) => {
    const reviewImage = await adminReviewRepository.findReviewImageById(imageId);

    if (!reviewImage) {
      throw new Error("Review image not found");
    }

    await adminReviewRepository.deleteReviewImage(imageId);
    await deleteLocalReviewImageFile(reviewImage.imageUrl);

    const remainingImages = await adminReviewRepository.findImagesByReviewId(
      reviewImage.reviewId
    );

    const nextMainImageUrl = remainingImages[0]?.imageUrl ?? null;

    await adminReviewRepository.updateReviewMainImage(
      reviewImage.reviewId,
      nextMainImageUrl
    );

    return {
      imageId,
      reviewId: reviewImage.reviewId,
      imageUrl: reviewImage.imageUrl,
    };
  },
};