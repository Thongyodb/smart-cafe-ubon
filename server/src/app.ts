import express from "express";
import cors from "cors";
import path from "path";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import reviewRoutes from "./routes/review.routes";
import cafeRoutes from "./routes/cafe.routes";
import metaRoutes from "./routes/meta.routes";
import userRoutes from "./routes/user.routes";
import photoSpotRoutes from "./routes/photoSpot.routes";
import adminMetaRoutes from "./routes/adminMeta.routes";
import favoriteRoutes from "./routes/favorite.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Smart Cafe Ubon API Running 🚀" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use("/api", reviewRoutes);

app.use("/api/cafes", cafeRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/photo-spots", photoSpotRoutes);
app.use("/api/admin-meta", adminMetaRoutes);
app.use("/api/favorites", favoriteRoutes);

export default app;