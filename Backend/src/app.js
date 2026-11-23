import express from "express";
import cors from "cors";
import "dotenv/config";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { UserModel } from "./models/user.model.js";
import { questionRoutes } from "./routes/question.routes.js";
import { gameRoutes } from "./routes/game.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares esenciales
app.use(cors()); // Permite que el frontend en React se conecte sin bloqueos
app.use(express.json()); // Permite recibir información del frontend en formato JSON

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/games", gameRoutes);

// Ruta de prueba para verificar que el servidor levantó
app.get("/", (req, res) => {
  res.send("Servidor del Desafío Mental funcionando correctamente");
});

// Manejo de rutas o recursos inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ message: "Recurso o ruta no encontrada" });
});

// Manejo global de errores (JSON inválido o errores internos)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "El formato del JSON enviado es inválido" });
  }
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

await UserModel.seedAdmin();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});