import { Router } from "express";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "Smart Cafe Ubon API and MySQL are connected ",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

export default router;