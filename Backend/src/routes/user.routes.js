import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const userRoutes = Router();

userRoutes.get("/", authenticate, authorize("ADMIN"), UserController.getAll);
userRoutes.get("/:id", authenticate, authorize("ADMIN"), UserController.getById);