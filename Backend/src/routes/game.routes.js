import { Router } from "express";
import { GameController } from "../controllers/game.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { gameSchema } from "../dtos/game.dto.js";

export const gameRoutes = Router();

gameRoutes.post("/", authenticate, validate(gameSchema), GameController.create);
gameRoutes.get("/history", authenticate, GameController.getMyHistory);
gameRoutes.get("/stats", authenticate, GameController.getMyStats);
gameRoutes.get("/ranking", authenticate, GameController.getRanking);