import { Router } from "express";
import { prisma } from "../shared/db/prisma.js";
import { authRoutes } from "../modules/auth/infra/http/auth.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);

routes.get("/health", (_req, res) => {
  res.json({ ok: true });
});

routes.get("/health/db", async (_req, res, next) => {
  try {
    await prisma.user.count();
    res.json({ ok: true, db: "up" });
  } catch (error) {
    next(error);
  }
});
