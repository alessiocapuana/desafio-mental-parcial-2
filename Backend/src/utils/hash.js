import bcrypt from 'bcrypt';

// Transforma la contraseña normal en un hash seguro
export const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compara la contraseña que pone el usuario con el hash guardado
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};