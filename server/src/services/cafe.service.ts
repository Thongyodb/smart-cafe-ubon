import { cafeRepository } from "../repositories/cafe.repository";

type GetCafesParams = {
  search?: string;
  categoryId?: number;
  districtId?: number;
  tagIds?: number[];
  limit?: number;
};

type CreateCafeParams = {
  name: string;
  description?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  phone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  coverImageUrl?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  categoryId: number;
  districtId: number;
  tagIds?: number[];
};

const calculateDistanceKm = (
  userLat: number,
  userLng: number,
  cafeLat: number,
  cafeLng: number
) => {
  const earthRadiusKm = 6371;

  const dLat = ((cafeLat - userLat) * Math.PI) / 180;
  const dLng = ((cafeLng - userLng) * Math.PI) / 180;

  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (cafeLat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const createSlug = (name: string) => {
  return `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/gi, "")
    .replace(/\s+/g, "-")}-${Date.now()}`;
};

export const cafeService = {
  getCafes: async (params: GetCafesParams) => {
    return cafeRepository.findAll(params);
  },

  getCafeById: async (id: number) => {
    const cafe = await cafeRepository.findById(id);

    if (!cafe) {
      throw new Error("Cafe not found");
    }

    return cafe;
  },

  getTopRatedCafes: async () => {
    return cafeRepository.findTopRated();
  },

  getPopularCafes: async () => {
    return cafeRepository.findPopular();
  },

  getNearbyCafes: async (lat: number, lng: number, radiusKm = 20) => {
    const cafes = await cafeRepository.findActiveForNearby();

    return cafes
      .map((cafe) => {
        const distanceKm = calculateDistanceKm(
          lat,
          lng,
          cafe.latitude,
          cafe.longitude
        );

        return {
          ...cafe,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((cafe) => cafe.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },

  createCafe: async (params: CreateCafeParams) => {
    const slug = createSlug(params.name);

    return cafeRepository.create({
      ...params,
      slug,
    });
  },

  updateCafe: async (id: number, params: CreateCafeParams) => {
    const cafe = await cafeRepository.findById(id);

    if (!cafe) {
      throw new Error("Cafe not found");
    }

    return cafeRepository.update(id, params);
  },

  deactivateCafe: async (id: number) => {
    const cafe = await cafeRepository.findById(id);

    if (!cafe) {
      throw new Error("Cafe not found");
    }

    return cafeRepository.deactivate(id);
  },

  getRandomCafe: async () => {
    const cafe = await cafeRepository.findRandom();

    if (!cafe) {
      throw new Error("No cafe available");
    }

    return cafe;
  },
};