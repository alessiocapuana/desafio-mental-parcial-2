import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { userSchema } from "../dtos/user.dto.js";
import { loginSchema } from "../dtos/login.dto.js";
import { authenticate } from "../middlewares/authenticate.js";
import { UserModel } from "../models/user.model.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(userSchema), AuthController.register);
authRoutes.post("/login", validate(loginSchema), AuthController.login);

authRoutes.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await UserModel.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});