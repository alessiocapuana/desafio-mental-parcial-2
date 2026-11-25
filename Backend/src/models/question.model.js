import crypto from "crypto";
import { readData, writeData } from "../utils/fileManager.js";

const FILE_NAME = "questions.json";

export class QuestionModel {
  // Copia de la pregunta sin la respuesta correcta (para los jugadores)
  static toPublic(question) {
    if (!question) return null;
    const { respuestaCorrecta, ...publicQuestion } = question;
    return publicQuestion;
  }

  static async getAll({ category, limit } = {}) {
    let questions = [];
    try {
      questions = await readData(FILE_NAME);
    } catch (e) {
      return [];
    }

    if (category && category !== "Todas") {
      questions = questions.filter(
        (q) => q.categoria.toLowerCase() === category.toLowerCase()
      );
    }

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        questions = questions
          .sort(() => Math.random() - 0.5)
          .slice(0, parsedLimit);
      }
    }

    return questions;
  }

  static async getById(id) {
    const questions = await this.getAll();
    return questions.find((q) => String(q.id) === String(id)) || null;
  }

  static async create(questionData) {
    const questions = await this.getAll();
    const newQuestion = {
      id: crypto.randomUUID(),
      ...questionData,
      createdAt: new Date().toISOString(),
    };

    questions.push(newQuestion);
    await writeData(FILE_NAME, questions);
    return newQuestion;
  }

  static async update(id, updateData) {
    const questions = await this.getAll();
    const index = questions.findIndex((q) => String(q.id) === String(id));

    if (index === -1) return null;

    questions[index] = {
      ...questions[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await writeData(FILE_NAME, questions);
    return questions[index];
  }

  static async delete(id) {
    const questions = await this.getAll();
    const index = questions.findIndex((q) => String(q.id) === String(id));

    if (index === -1) return false;

    questions.splice(index, 1);
    await writeData(FILE_NAME, questions);
    return true;
  }
}