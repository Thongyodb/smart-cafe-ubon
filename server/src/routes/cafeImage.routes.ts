import { Router } from "express";
import multer from "multer";
import path from "path";
import { cafeImageController } from "../controllers/cafeImage.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, "uploads/cafes");
  },
  filename: (_req, file, callback) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000
    )}${path.extname(file.originalname)}`;

    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }

    callback(null, true);
  },
});

router.get("/:cafeId", requireAdmin, cafeImageController.getCafeImages);

router.post(
  "/:cafeId",
  requireAdmin,
  upload.array("images", 10),
  cafeImageController.uploadCafeImages
);

router.patch(
  "/:imageId/cover",
  requireAdmin,
  cafeImageController.setCoverImage
);

router.delete("/:imageId", requireAdmin, cafeImageController.deleteCafeImage);

export default router;