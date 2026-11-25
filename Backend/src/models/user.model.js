import crypto from "crypto";
import { readData, writeData } from "../utils/fileManager.js";
import { hashPassword } from "../utils/hash.js";

const FILE_NAME = "users.json";

export class UserModel {
  // Devuelve una copia del usuario sin la contraseña (nunca se envía al cliente)
  static toPublic(user) {
    if (!user) return null;
    const { password, ...publicUser } = user;
    return publicUser;
  }

  // Precarga un usuario administrador si no existe
  static async seedAdmin() {
    // Si readData falla porque está vacío, atajamos con un array vacío []
    let users = [];
    try { users = await readData(FILE_NAME); } catch(e) {} 

    const adminExists = users.some((u) => u.email === "admin@admin.com");

    if (!adminExists) {
      const hashedPassword = await hashPassword("admin1234");
      users.push({
        id: crypto.randomUUID(),
        name: "Administrador",
        email: "admin@admin.com",
        password: hashedPassword,
        role: "ADMIN",
        createdAt: new Date().toISOString()
      });
      await writeData(FILE_NAME, users);
      console.log("⭐ Usuario ADMIN listo en users.json (admin@admin.com / admin1234)");
    }
  }

  static async getAll() {
    try { return await readData(FILE_NAME); } catch(e) { return []; }
  }

  static async getById(id) {
    const users = await this.getAll();
    return users.find((user) => user.id === id) || null;
  }

  static async getByEmail(email) {
    const users = await this.getAll();
    return users.find((user) => user.email === email) || null;
  }

  static async create(userData) {
    const users = await this.getAll();
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      role: userData.role || "USER",
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeData(FILE_NAME, users);
    return newUser;
  }
}