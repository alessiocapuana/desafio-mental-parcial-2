import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // El token suele venir como "Bearer eyJhbGci..." así que lo separamos
  const token = authHeader.split(" ")[1]; 
  
  try {
    const decodedUser = verifyToken(token);
    req.user = decodedUser; // Guardamos los datos del usuario en la request para usarlos después
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};