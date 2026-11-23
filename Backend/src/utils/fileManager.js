import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Esto permite ubicar la carpeta 'data' sin importar desde dónde ejecutes Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readData = async (fileName) => {
    const filePath = path.join(__dirname, '../data', fileName);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
};

export const writeData = async (fileName, data) => {
    const filePath = path.join(__dirname, '../data', fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};