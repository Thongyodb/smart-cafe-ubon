import fs from "fs/promises";
import path from "path";
import { cafeImageRepository } from "../repositories/cafeImage.repository";

const getLocalFilePathFromUrl = (imageUrl: string) => {
  const filename = imageUrl.split("/").pop();

  if (!filename) {
    return null;
  }

  return path.join(process.cwd(), "uploads", "cafes", filename);
};

const deleteLocalCafeImageFile = async (imageUrl?: string | null) => {
  if (!imageUrl) {
    return;
  }

  const filePath = getLocalFilePathFromUrl(imageUrl);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch {
    // ถ้าไฟล์ไม่มีอยู่แล้ว ให้ข้าม ไม่ต้องทำให้ระบบพัง
  }
};

export const cafeImageService = {
  getCafeImages: async (cafeId: number) => {
    const cafe = await cafeImageRepository.findCafeById(cafeId);

    if (!cafe) {
      throw new Error("Cafe not found");
    }

    return cafeImageRepository.findImagesByCafeId(cafeId);
  },

  uploadCafeImages: async (cafeId: number, imageUrls: string[]) => {
    const cafe = await cafeImageRepository.findCafeById(cafeId);

    if (!cafe) {
      throw new Error("Cafe not found");
    }

    if (imageUrls.length === 0) {
      throw new Error("No image uploaded");
    }

    const images = await cafeImageRepository.createImages(cafeId, imageUrls);

    if (!cafe.coverImageUrl && imageUrls[0]) {
      await cafeImageRepository.setCafeCoverImage(cafeId, imageUrls[0]);
    }

    return images;
  },

  deleteCafeImage: async (imageId: number) => {
    const image = await cafeImageRepository.findImageById(imageId);

    if (!image) {
      throw new Error("Image not found");
    }

    await cafeImageRepository.deleteImage(imageId);
    await deleteLocalCafeImageFile(image.imageUrl);

    if (image.cafe.coverImageUrl === image.imageUrl) {
      const remainingImages = await cafeImageRepository.findImagesByCafeId(
        image.cafeId
      );

      const nextCoverImageUrl = remainingImages[0]?.imageUrl ?? null;

      await cafeImageRepository.setCafeCoverImage(
        image.cafeId,
        nextCoverImageUrl
      );
    }

    return {
      deletedImageId: imageId,
    };
  },

  setCoverImage: async (imageId: number) => {
    const image = await cafeImageRepository.findImageById(imageId);

    if (!image) {
      throw new Error("Image not found");
    }

    const cafe = await cafeImageRepository.setCafeCoverImage(
      image.cafeId,
      image.imageUrl
    );

    return cafe;
  },
};