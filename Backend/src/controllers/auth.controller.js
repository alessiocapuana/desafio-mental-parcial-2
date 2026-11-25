import { AuthModel } from "../models/auth.model.js";
import { UserModel } from "../models/user.model.js";

export class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    const token = await AuthModel.login(email, password);

    if (!token) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.status(200).json({ token });
  }

  static async register(req, res) {
    const user = await AuthModel.register(req.body);

    if (!user) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Se devuelve el usuario sin el hash de la contraseña
    res.status(201).json(UserModel.toPublic(user));
  }

  static async profile(req, res) {
    try {
      const user = await UserModel.getById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.status(200).json(UserModel.toPublic(user));
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el perfil" });
    }
  }
}
