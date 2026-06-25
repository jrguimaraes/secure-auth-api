import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../../../main/middlewares/require-auth.js";
import { authRateLimit } from "../../../../main/middlewares/auth-rate-limit.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/register", authRateLimit, authController.register);
authRoutes.post("/login", authRateLimit, authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireAuth, authController.me);

export { authRoutes };