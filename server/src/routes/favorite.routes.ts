import { Router } from "express";
import { favoriteController } from "../controllers/favorite.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, favoriteController.getFavorites);
router.post("/:cafeId/toggle", requireAuth, favoriteController.toggleFavorite);

export default router;