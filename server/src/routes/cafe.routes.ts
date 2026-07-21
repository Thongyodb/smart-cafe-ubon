import { Router } from "express";
import { cafeController } from "../controllers/cafe.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", cafeController.getCafes);
router.post("/", requireAdmin, cafeController.createCafe);
router.put("/:id", requireAdmin, cafeController.updateCafe);
router.delete("/:id", requireAdmin, cafeController.deactivateCafe);

router.get("/top-rated", cafeController.getTopRatedCafes);
router.get("/popular", cafeController.getPopularCafes);
router.get("/random", cafeController.getRandomCafe);
router.get("/nearby", cafeController.getNearbyCafes);
router.get("/:id", cafeController.getCafeById);

export default router;