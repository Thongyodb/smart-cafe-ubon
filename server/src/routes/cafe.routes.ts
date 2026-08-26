import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { cafeController } from "../controllers/cafe.controller";
import { optionalAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "cafes");

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

router.get("/", cafeController.getCafes);

router.post(
  "/",
  requireAdmin,
  upload.single("coverImage"),
  cafeController.createCafe
);

router.patch(
  "/:id/cover-focus",
  requireAdmin,
  cafeController.updateCafeCoverFocus
);

router.put(
  "/:id",
  requireAdmin,
  upload.single("coverImage"),
  cafeController.updateCafe
);

router.delete("/:id", requireAdmin, cafeController.deactivateCafe);

router.get("/top-rated", cafeController.getTopRatedCafes);
router.get("/popular", cafeController.getPopularCafes);
router.get("/random", cafeController.getRandomCafe);
router.get("/nearby", cafeController.getNearbyCafes);

router.get("/:id", optionalAuth, cafeController.getCafeById);

export default router;