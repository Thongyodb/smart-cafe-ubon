import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.middleware";
import { photoSpotController } from "../controllers/photoSpot.controller";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "photo-spots");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const fileExtension = path.extname(file.originalname);
    const safeFileName = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000_000
    )}${fileExtension}`;

    callback(null, safeFileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/", requireAdmin, photoSpotController.getPhotoSpots);

router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  photoSpotController.createPhotoSpot
);

router.get("/:id", requireAdmin, photoSpotController.getPhotoSpotById);

router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  photoSpotController.updatePhotoSpot
);

router.delete("/:id", requireAdmin, photoSpotController.deletePhotoSpot);

export default router;