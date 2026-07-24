import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import { adminMetaController } from "../controllers/adminMeta.controller";

const router = Router();

router.get("/categories", requireAdmin, adminMetaController.getCategories);
router.post("/categories", requireAdmin, adminMetaController.createCategory);
router.put("/categories/:id", requireAdmin, adminMetaController.updateCategory);
router.delete(
  "/categories/:id",
  requireAdmin,
  adminMetaController.deleteCategory
);

router.get("/tags", requireAdmin, adminMetaController.getTags);
router.post("/tags", requireAdmin, adminMetaController.createTag);
router.put("/tags/:id", requireAdmin, adminMetaController.updateTag);
router.delete("/tags/:id", requireAdmin, adminMetaController.deleteTag);

export default router;