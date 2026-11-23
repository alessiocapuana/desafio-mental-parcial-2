import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { questionSchema, updateQuestionSchema } from "../dtos/question.dto.js";

export const questionRoutes = Router();

questionRoutes.get("/", authenticate, QuestionController.getAll);
questionRoutes.get("/:id", authenticate, QuestionController.getById);
questionRoutes.post("/", authenticate, authorize("ADMIN"), validate(questionSchema), QuestionController.create);
questionRoutes.put("/:id", authenticate, authorize("ADMIN"), validate(updateQuestionSchema), QuestionController.update);
questionRoutes.delete("/:id", authenticate, authorize("ADMIN"), QuestionController.delete);