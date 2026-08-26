import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";

import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { userController } from "../controllers/user.controller";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "avatars");

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

router.get("/me", requireAuth, userController.getMe);

router.put(
  "/me",
  requireAuth,
  upload.single("avatar"),
  userController.updateMe
);

router.get("/", requireAdmin, userController.getUsers);

router.patch("/:id/status", requireAdmin, userController.updateUserStatus);

export default router;