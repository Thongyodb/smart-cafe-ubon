import { reviewRepository } from "../repositories/review.repository";

const updateCafeRatingSummary = async (cafeId: number) => {
  const summary = await reviewRepository.calculateCafeRating(cafeId);

  const averageRating = summary._avg.rating
    ? Number(summary._avg.rating.toFixed(1))
    : 0;

  const totalReviews = summary._count.rating;

  await reviewRepository.updateCafeRating(cafeId, averageRating, totalReviews);
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

    await reviewRepository.delete(reviewId);
    await updateCafeRatingSummary(review.cafeId);

    return {
      reviewId,
      cafeId: review.cafeId,
    };
  },
};