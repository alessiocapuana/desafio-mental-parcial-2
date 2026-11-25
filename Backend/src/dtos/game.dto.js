import Joi from "joi";

// El cliente solo informa QUÉ eligió en cada pregunta.
// Puntaje, aciertos, rachas y textos los calcula el servidor (game.model.js).
const respuestaSchema = Joi.object({
  preguntaId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  // 0 a 3 = opción elegida, null = se agotó el tiempo
  respuestaSeleccionada: Joi.number().integer().min(0).max(3).allow(null).required(),
  // true = la pregunta quedó sin responder porque se abandonó la partida
  abandonada: Joi.boolean().default(false),
});

export const gameSchema = Joi.object({
  categoria: Joi.string().required(),
  cantidadPreguntas: Joi.number().integer().valid(5, 10).required(),
  fechaInicio: Joi.string().isoDate().required(),
  fechaFinalizacion: Joi.string().isoDate().required(),
  respuestas: Joi.array().items(respuestaSchema).min(1).max(10).required(),
  estado: Joi.string().valid("completada", "abandonada").required(),
});
