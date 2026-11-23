import crypto from "crypto";
import { readData, writeData } from "../utils/fileManager.js";

const FILE_NAME = "games.json";

export class GameModel {
  static async getAll() {
    try {
      const games = await readData(FILE_NAME);
      return Array.isArray(games) ? games : [];
    } catch (e) {
      return [];
    }
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