import { UserModel } from "../models/user.model.js";

export class UserController {
  static async getAll(req, res) {
    const users = await UserModel.getAll();
    // Excluimos las contraseñas antes de devolver la lista por seguridad
    res.status(200).json(users.map((user) => UserModel.toPublic(user)));
  }

  static async getById(req, res) {
    const { id } = req.params;
    const user = await UserModel.getById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(UserModel.toPublic(user));
  }
}
