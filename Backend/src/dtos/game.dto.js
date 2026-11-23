import Joi from "joi";

const respuestaSchema = Joi.object({
  preguntaId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  enunciado: Joi.string().required(),
  opciones: Joi.array().items(Joi.string()).length(4).required(),
  respuestaSeleccionada: Joi.number().integer().min(0).max(3).allow(null).required(),
  respuestaSeleccionadaTexto: Joi.string().required(),
  respuestaCorrecta: Joi.number().integer().min(0).max(3).required(),
  respuestaCorrectaTexto: Joi.string().required(),
  resultado: Joi.string()
    .valid("correcta", "incorrecta", "sin_responder", "abandonada")
    .required(),
  puntajeObtenido: Joi.number().integer().min(0).required(),
});

export const gameSchema = Joi.object({
  categoria: Joi.string().required(),
  cantidadPreguntas: Joi.number().integer().min(1).required(),
  preguntasRespondidas: Joi.number().integer().min(0).required(),
  puntaje: Joi.number().integer().min(0).required(),
  respuestasCorrectas: Joi.number().integer().min(0).required(),
  respuestasIncorrectas: Joi.number().integer().min(0).required(),
  mejorRacha: Joi.number().integer().min(0).required(),
  duracion: Joi.number().integer().min(0).required(),
  fechaInicio: Joi.string().isoDate().required(),
  fechaFinalizacion: Joi.string().isoDate().required(),
  respuestas: Joi.array().items(respuestaSchema).required(),
  estado: Joi.string().valid("completada", "abandonada").required(),
});