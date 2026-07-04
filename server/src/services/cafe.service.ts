import { cafeRepository } from "../repositories/cafe.repository";

type GetCafesParams = {
  search?: string;
  categoryId?: number;
  districtId?: number;
  tagIds?: number[];
  limit?: number;
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

  getRandomCafe: async () => {
    const cafe = await cafeRepository.findRandom();

    if (!cafe) {
      throw new Error("No cafe available");
    }

    return cafe;
  },
};