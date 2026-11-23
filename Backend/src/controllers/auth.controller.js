import { AuthModel } from "../models/auth.model.js";

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

    res.status(201).json(user);
  }

  static async profile(req, res) {
    // req.user ya viene con los datos limpios gracias al middleware 'authenticate'
    res.status(200).json(req.user);
  }
}