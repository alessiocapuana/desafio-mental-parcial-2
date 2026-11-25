import { GameModel } from "../models/game.model.js";
import { UserModel } from "../models/user.model.js";

export class GameController {
  static async create(req, res) {
    try {
      // El servidor calcula los resultados a partir de las respuestas elegidas
      const partida = await GameModel.buildGame(req.body);

      const user = await UserModel.getById(req.user.id);
      const newGame = await GameModel.create({
        ...partida,
        userId: req.user.id,
        usuario: user ? user.name : req.user.email,
      });

      res.status(201).json(newGame);
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      res.status(500).json({ message: "Error al guardar la partida", error: error.message });
    }
  }

  static async getMyHistory(req, res) {
    try {
      const { categoria, estado } = req.query;
      const games = await GameModel.getByUser(req.user.id, { categoria, estado });
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el historial", error: error.message });
    }
  }

  static async getMyStats(req, res) {
    try {
      const stats = await GameModel.getStatsByUser(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las estadísticas", error: error.message });
    }
  }

  static async getRanking(req, res) {
    try {
      const ranking = await GameModel.getRanking(10);
      res.json(ranking);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el ranking", error: error.message });
    }
  }
}
