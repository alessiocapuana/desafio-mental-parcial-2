import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { UserModel } from "./user.model.js";

export class AuthModel {
  
  static async login(email, password) {
    const user = await UserModel.getByEmail(email);
    if (!user) return null; // No existe el mail

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return null; // Contraseña incorrecta

    // Genera el token si todo está bien
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return token;
  }

  static async register(userData) {
    const existingUser = await UserModel.getByEmail(userData.email);
    if (existingUser) return null; // El mail ya está registrado

    const hashedPassword = await hashPassword(userData.password);
    const newUser = await UserModel.create({
      ...userData,
      password: hashedPassword,
    });

    return newUser;
  }
}