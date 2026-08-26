import { Router } from "express";
import { cafeController } from "../controllers/cafe.controller";
import { optionalAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", cafeController.getCafes);

router.post("/", requireAdmin, cafeController.createCafe);
router.patch(
  "/:id/cover-focus",
  requireAdmin,
  cafeController.updateCafeCoverFocus);
router.put("/:id", requireAdmin, cafeController.updateCafe);
router.delete("/:id", requireAdmin, cafeController.deactivateCafe);

router.get("/top-rated", cafeController.getTopRatedCafes);
router.get("/popular", cafeController.getPopularCafes);
router.get("/random", cafeController.getRandomCafe);
router.get("/nearby", cafeController.getNearbyCafes);

router.get("/:id", optionalAuth, cafeController.getCafeById);

export default router;