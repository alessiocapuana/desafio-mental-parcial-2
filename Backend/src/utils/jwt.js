import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

// Crea el token con los datos del usuario (id, email y rol)
export const generateToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); 
};

// Revisa si el token que manda el usuario es válido
export const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};