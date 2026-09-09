import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*").split(",").map((s) => s.trim());
app.use(cors({ origin: allowedOrigins.includes("*") ? true : allowedOrigins }));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "iphonizate-os-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/users", usersRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`iPhonizate OS API escuchando en :${PORT}`));
