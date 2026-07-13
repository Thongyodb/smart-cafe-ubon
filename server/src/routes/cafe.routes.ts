import { Router } from "express";
import { cafeController } from "../controllers/cafe.controller";

const router = Router();

router.get("/", cafeController.getCafes);
router.post("/", cafeController.createCafe);

router.get("/top-rated", cafeController.getTopRatedCafes);
router.get("/popular", cafeController.getPopularCafes);
router.get("/random", cafeController.getRandomCafe);
router.get("/nearby", cafeController.getNearbyCafes);
router.get("/:id", cafeController.getCafeById);

export default router;