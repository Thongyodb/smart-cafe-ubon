import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import { userController } from "../controllers/user.controller";

const router = Router();

router.get("/", requireAdmin, userController.getUsers);
router.patch("/:id/status", requireAdmin, userController.updateUserStatus);

export default router;