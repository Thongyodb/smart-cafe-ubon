import { Router } from "express";
import { metaController } from "../controllers/meta.controller";

const router = Router();

router.get("/filters", metaController.getFilters);

export default router;