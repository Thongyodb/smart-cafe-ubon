const API_BASE_URL = "http://localhost:5000";

export const FALLBACK_CAFE_IMAGE =
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80";

export const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};

export const getCafeImageUrl = (imageUrl?: string | null) => {
  return getImageUrl(imageUrl) || FALLBACK_CAFE_IMAGE;
};