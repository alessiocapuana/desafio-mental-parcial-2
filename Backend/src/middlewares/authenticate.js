import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // El token tiene que venir como "Bearer eyJhbGci..."
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No se envió el token de autenticación" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedUser = verifyToken(token);
    req.user = decodedUser; // Guardamos los datos del usuario en la request para usarlos después
    next();
  } catch (error) {
    return res.status(401).json({ message: "La sesión es inválida o expiró. Volvé a iniciar sesión." });
  }
};
