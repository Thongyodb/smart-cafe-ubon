import fs from "fs/promises";
import path from "path";
import { reviewRepository } from "../repositories/review.repository";

const MAX_REVIEW_IMAGES = 5;

const updateCafeRatingSummary = async (cafeId: number) => {
  const summary = await reviewRepository.calculateCafeRating(cafeId);

  const averageRating = summary._avg.rating
    ? Number(summary._avg.rating.toFixed(1))
    : 0;

  const totalReviews = summary._count.rating;

  await reviewRepository.updateCafeRating(cafeId, averageRating, totalReviews);
};

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

export const reviewService = {
  getCafeReviews: async (cafeId: number) => {
    return reviewRepository.findByCafeId(cafeId);
  },

  createReview: async (
    userId: number,
    cafeId: number,
    rating: number,
    comment?: string | null,
    imageUrls: string[] = []
  ) => {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    if (imageUrls.length > MAX_REVIEW_IMAGES) {
      throw new Error(`A review can have up to ${MAX_REVIEW_IMAGES} images`);
    }

    const existingReview = await reviewRepository.findUserReview(userId, cafeId);

    if (existingReview) {
      throw new Error("You already reviewed this cafe");
    }

    const review = await reviewRepository.create({
      userId,
      cafeId,
      rating,
      comment: comment?.trim() || null,
      imageUrls,
    });

    await updateCafeRatingSummary(cafeId);

    return review;
  },

  updateReview: async (
    userId: number,
    reviewId: number,
    rating: number,
    comment?: string | null,
    imageUrls: string[] = []
  ) => {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("You can edit only your own review");
    }

    const currentImageCount = review.images?.length ?? 0;
    const nextImageCount = currentImageCount + imageUrls.length;

    if (nextImageCount > MAX_REVIEW_IMAGES) {
      throw new Error(
        `A review can have up to ${MAX_REVIEW_IMAGES} images. Current: ${currentImageCount}, adding: ${imageUrls.length}`
      );
    }

    const updatedReview = await reviewRepository.update(reviewId, {
      rating,
      comment: comment?.trim() || null,
      imageUrls,
    });

    await updateCafeRatingSummary(review.cafeId);

    return updatedReview;
  },

  deleteReview: async (userId: number, reviewId: number) => {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("You can delete only your own review");
    }

    await Promise.all(
      (review.images ?? []).map((image) =>
        deleteLocalReviewImageFile(image.imageUrl)
      )
    );

    await reviewRepository.delete(reviewId);
    await updateCafeRatingSummary(review.cafeId);

    return {
      reviewId,
      cafeId: review.cafeId,
    };
  },

  deleteReviewImage: async (userId: number, imageId: number) => {
    const reviewImage = await reviewRepository.findReviewImageById(imageId);

    if (!reviewImage) {
      throw new Error("Review image not found");
    }

    if (reviewImage.review.userId !== userId) {
      throw new Error("You can delete only your own review image");
    }

    await reviewRepository.deleteReviewImage(imageId);
    await deleteLocalReviewImageFile(reviewImage.imageUrl);

    const remainingImages = await reviewRepository.findImagesByReviewId(
      reviewImage.reviewId
    );

    const nextMainImageUrl = remainingImages[0]?.imageUrl ?? null;

    await reviewRepository.updateReviewMainImage(
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