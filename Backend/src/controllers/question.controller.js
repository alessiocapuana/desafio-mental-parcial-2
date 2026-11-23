import { QuestionModel } from "../models/question.model.js";

export class QuestionController {
  static async getAll(req, res) {
    try {
      const { category, limit } = req.query;
      const questions = await QuestionModel.getAll({ category, limit });
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las preguntas", error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const question = await QuestionModel.getById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la pregunta", error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const newQuestion = await QuestionModel.create(req.body);
      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(500).json({ message: "Error al crear la pregunta", error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updatedQuestion = await QuestionModel.update(req.params.id, req.body);
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
      }
      res.json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la pregunta", error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await QuestionModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
      }
      res.json({ message: "Pregunta eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la pregunta", error: error.message });
    }
  }
}