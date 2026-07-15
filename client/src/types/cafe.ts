export type Category = {
  id: number;
  name: string;
  description?: string | null;
};

export type District = {
  id: number;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
  type: "STYLE" | "COLOR" | "VIEW" | "TIME" | "FEATURE";
};

export type CafeTag = {
  id: number;
  cafeId: number;
  tagId: number;
  tag: Tag;
};

export type PhotoSpot = {
  id: number;
  cafeId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  bestTime?: string | null;
  cameraAngle?: string | null;
};

export type ReviewUser = {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
};

export type Review = {
  id: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  user?: ReviewUser;
};

export type Cafe = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  phone?: string | null;
  coverImageUrl?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  averageRating: number;
  totalReviews: number;
  totalViews: number;
  category: Category;
  district: District;
  photoSpots?: PhotoSpot[];
  cafeTags?: CafeTag[];
  reviews?: Review[];
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;

  distanceKm?: number;
};

export type CafeListResponse = {
  success: boolean;
  count: number;
  data: Cafe[];
};

export type CafeDetailResponse = {
  success: boolean;
  data: Cafe;
};