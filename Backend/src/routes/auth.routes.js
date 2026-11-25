import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { userSchema } from "../dtos/user.dto.js";
import { loginSchema } from "../dtos/login.dto.js";
import { authenticate } from "../middlewares/authenticate.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(userSchema), AuthController.register);
authRoutes.post("/login", validate(loginSchema), AuthController.login);
authRoutes.get("/profile", authenticate, AuthController.profile);
