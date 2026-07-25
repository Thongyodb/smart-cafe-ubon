import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import { adminDashboardController } from "../controllers/adminDashboard.controller";

const router = Router();

router.get("/", requireAdmin, adminDashboardController.getDashboardStats);

export default router;