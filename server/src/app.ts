import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import cafeRoutes from "./routes/cafe.routes";
import metaRoutes from "./routes/meta.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Smart Cafe Ubon API Running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/meta", metaRoutes);

export default app;