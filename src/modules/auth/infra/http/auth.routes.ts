import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../../../main/middlewares/require-auth.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireAuth, authController.me);

export { authRoutes };