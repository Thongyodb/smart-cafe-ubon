import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import { photoSpotController } from "../controllers/photoSpot.controller";

const router = Router();

router.get("/", requireAdmin, photoSpotController.getPhotoSpots);
router.post("/", requireAdmin, photoSpotController.createPhotoSpot);
router.get("/:id", requireAdmin, photoSpotController.getPhotoSpotById);
router.put("/:id", requireAdmin, photoSpotController.updatePhotoSpot);
router.delete("/:id", requireAdmin, photoSpotController.deletePhotoSpot);

export default router;