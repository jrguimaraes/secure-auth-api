import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh", authController.refresh);

export { authRoutes };