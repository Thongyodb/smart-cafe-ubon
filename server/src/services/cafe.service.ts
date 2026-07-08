import { cafeRepository } from "../repositories/cafe.repository";

type GetCafesParams = {
  search?: string;
  categoryId?: number;
  districtId?: number;
  tagIds?: number[];
  limit?: number;
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

  getRandomCafe: async () => {
    const cafe = await cafeRepository.findRandom();

    if (!cafe) {
      throw new Error("No cafe available");
    }

    return cafe;
  },
};