import { Router } from "express";
import { prisma } from "../shared/db/prisma.js";

export const routes = Router();

routes.get("/health", (_req, res) => res.json({ ok: true }));

routes.get("/health/db", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: "up" });
});
