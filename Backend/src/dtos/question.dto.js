import Joi from "joi";

export const questionSchema = Joi.object({
  categoria: Joi.string().min(2).max(100).required(),
  enunciado: Joi.string().min(5).max(500).required(),
  opciones: Joi.array().items(Joi.string().min(1)).length(4).required(),
  respuestaCorrecta: Joi.number().integer().min(0).max(3).required(),
  puntaje: Joi.number().integer().min(1).default(10),
});

export const updateQuestionSchema = Joi.object({
  categoria: Joi.string().min(2).max(100),
  enunciado: Joi.string().min(5).max(500),
  opciones: Joi.array().items(Joi.string().min(1)).length(4),
  respuestaCorrecta: Joi.number().integer().min(0).max(3),
  puntaje: Joi.number().integer().min(1),
}).min(1);

// Respuesta del jugador a una pregunta. null = se agotó el tiempo.
export const answerSchema = Joi.object({
  respuestaSeleccionada: Joi.number().integer().min(0).max(3).allow(null).required(),
});
