import { photoSpotRepository } from "../repositories/photoSpot.repository";

type PhotoSpotParams = {
  cafeId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  bestTime?: string | null;
  cameraAngle?: string | null;
};

export const photoSpotService = {
  getPhotoSpots: async () => {
    return photoSpotRepository.findAll();
  },

  getPhotoSpotById: async (id: number) => {
    const photoSpot = await photoSpotRepository.findById(id);

    if (!photoSpot) {
      throw new Error("Photo spot not found");
    }

    return photoSpot;
  },

  createPhotoSpot: async (params: PhotoSpotParams) => {
    return photoSpotRepository.create(params);
  },

  updatePhotoSpot: async (id: number, params: PhotoSpotParams) => {
    const photoSpot = await photoSpotRepository.findById(id);

    if (!photoSpot) {
      throw new Error("Photo spot not found");
    }

    return photoSpotRepository.update(id, params);
  },

  deletePhotoSpot: async (id: number) => {
    const photoSpot = await photoSpotRepository.findById(id);

    if (!photoSpot) {
      throw new Error("Photo spot not found");
    }

    return photoSpotRepository.delete(id);
  },
};