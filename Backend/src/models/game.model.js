import crypto from "crypto";
import { readData, writeData } from "../utils/fileManager.js";
import { QuestionModel } from "./question.model.js";

const FILE_NAME = "games.json";

// Error de validación de negocio: el controlador lo responde con este status
function gameError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export class GameModel {
  static async getAll() {
    try {
      const games = await readData(FILE_NAME);
      return Array.isArray(games) ? games : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Arma la partida a partir de las respuestas elegidas por el jugador.
   * Todos los resultados (aciertos, puntaje, rachas, textos) se calculan acá
   * comparando contra el banco de preguntas, sin confiar en lo que manda el cliente.
   */
  static async buildGame({ categoria, cantidadPreguntas, fechaInicio, fechaFinalizacion, respuestas, estado }) {
    const inicio = new Date(fechaInicio).getTime();
    const fin = new Date(fechaFinalizacion).getTime();

    if (fin < inicio) {
      throw gameError("La fecha de finalización no puede ser anterior a la de inicio");
    }
    if (fin > Date.now() + 60 * 1000) {
      throw gameError("La fecha de finalización no puede estar en el futuro");
    }
    if (respuestas.length > cantidadPreguntas) {
      throw gameError("Hay más respuestas que preguntas en la partida");
    }

    const ids = respuestas.map((r) => String(r.preguntaId));
    if (new Set(ids).size !== ids.length) {
      throw gameError("No se puede responder dos veces la misma pregunta");
    }

    const indiceAbandonada = respuestas.findIndex((r) => r.abandonada);
    if (estado === "completada") {
      if (respuestas.length !== cantidadPreguntas || indiceAbandonada !== -1) {
        throw gameError("Una partida completada debe tener todas sus preguntas respondidas");
      }
    } else if (indiceAbandonada !== -1 && indiceAbandonada !== respuestas.length - 1) {
      throw gameError("Solo la última pregunta puede quedar marcada como abandonada");
    }

    const banco = await QuestionModel.getAll();

    let puntaje = 0;
    let correctas = 0;
    let incorrectas = 0;
    let rachaActual = 0;
    let mejorRacha = 0;

    const detalle = respuestas.map((r) => {
      const pregunta = banco.find((q) => String(q.id) === String(r.preguntaId));
      if (!pregunta) {
        throw gameError(`La pregunta ${r.preguntaId} no existe`);
      }
      if (pregunta.categoria.toLowerCase() !== categoria.toLowerCase()) {
        throw gameError(`La pregunta ${r.preguntaId} no pertenece a la categoría ${categoria}`);
      }

      const base = {
        preguntaId: pregunta.id,
        enunciado: pregunta.enunciado,
        opciones: [...pregunta.opciones],
        respuestaCorrecta: pregunta.respuestaCorrecta,
        respuestaCorrectaTexto: pregunta.opciones[pregunta.respuestaCorrecta],
      };

      if (r.abandonada) {
        return {
          ...base,
          respuestaSeleccionada: null,
          respuestaSeleccionadaTexto: "Sin responder (partida abandonada)",
          resultado: "abandonada",
          puntajeObtenido: 0,
        };
      }

      if (r.respuestaSeleccionada === null) {
        incorrectas++;
        rachaActual = 0;
        return {
          ...base,
          respuestaSeleccionada: null,
          respuestaSeleccionadaTexto: "Sin responder (tiempo agotado)",
          resultado: "sin_responder",
          puntajeObtenido: 0,
        };
      }

      const esCorrecta = r.respuestaSeleccionada === pregunta.respuestaCorrecta;
      const puntos = esCorrecta ? pregunta.puntaje || 10 : 0;

      if (esCorrecta) {
        correctas++;
        puntaje += puntos;
        rachaActual++;
        mejorRacha = Math.max(mejorRacha, rachaActual);
      } else {
        incorrectas++;
        rachaActual = 0;
      }

      return {
        ...base,
        respuestaSeleccionada: r.respuestaSeleccionada,
        respuestaSeleccionadaTexto: pregunta.opciones[r.respuestaSeleccionada],
        resultado: esCorrecta ? "correcta" : "incorrecta",
        puntajeObtenido: puntos,
      };
    });

    return {
      categoria,
      cantidadPreguntas,
      preguntasRespondidas: correctas + incorrectas,
      puntaje,
      respuestasCorrectas: correctas,
      respuestasIncorrectas: incorrectas,
      mejorRacha,
      duracion: fin - inicio,
      fechaInicio: new Date(inicio).toISOString(),
      fechaFinalizacion: new Date(fin).toISOString(),
      respuestas: detalle,
      estado,
    };
  }

  static async create(gameData) {
    const games = await this.getAll();
    const newGame = {
      id: crypto.randomUUID(),
      ...gameData,
    };

    games.push(newGame);
    await writeData(FILE_NAME, games);
    return newGame;
  }

  static async getByUser(userId, { categoria, estado } = {}) {
    let games = (await this.getAll()).filter((g) => g.userId === userId);

    games.sort(
      (a, b) =>
        new Date(b.fechaFinalizacion).getTime() -
        new Date(a.fechaFinalizacion).getTime()
    );

    if (categoria) {
      games = games.filter((g) => g.categoria === categoria);
    }

    if (estado) {
      games = games.filter((g) => g.estado === estado);
    }

    return games;
  }

  static async getStatsByUser(userId) {
    const games = await this.getAll();
    const completadas = games.filter(
      (g) => g.userId === userId && g.estado === "completada"
    );

    let totalPreguntas = 0;
    let respuestasCorrectas = 0;
    let puntajeTotal = 0;
    let puntajeMasAlto = 0;
    let mejorRachaGlobal = 0;

    for (const partida of completadas) {
      totalPreguntas += partida.preguntasRespondidas;
      respuestasCorrectas += partida.respuestasCorrectas;
      puntajeTotal += partida.puntaje;
      if (partida.puntaje > puntajeMasAlto) puntajeMasAlto = partida.puntaje;
      if (partida.mejorRacha > mejorRachaGlobal) mejorRachaGlobal = partida.mejorRacha;
    }

    const porcentajeAciertos =
      totalPreguntas === 0
        ? 0
        : Math.round((respuestasCorrectas / totalPreguntas) * 100);

    return {
      totalPartidas: completadas.length,
      totalPreguntas,
      porcentajeAciertos,
      puntajeMasAlto,
      mejorRachaGlobal,
      puntajeTotal,
    };
  }

  static async getRanking(limit = 10) {
    const games = await this.getAll();
    const completadas = games.filter((g) => g.estado === "completada");

    completadas.sort((a, b) => {
      if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
      if (a.duracion !== b.duracion) return a.duracion - b.duracion;
      return (
        new Date(a.fechaFinalizacion).getTime() -
        new Date(b.fechaFinalizacion).getTime()
      );
    });

    return completadas.slice(0, limit);
  }
}
