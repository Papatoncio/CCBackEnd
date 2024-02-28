import jwt from "jsonwebtoken";
import config from "../config";
import bcrypt from 'bcryptjs';

//Metódo para verificar que exista un token
export const verifyToken = async (req, res, next) => {
    try {
        //Obtiene token desde el header x-access-token
        const token = req.headers["x-access-token"];

        console.log(token);

        //Si se guardo un token continua si no muestra un error
        if (!token) return res.status(403).json({ message: "No token provided" });

        //Obtiene los datos del usuario mediante el descifrado del token
        const decoded = jwt.verify(token, config.SECRET);
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export const encryptPassword = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
}

export const comparePassword = async (contrasena, contrasenaBD) => {
    return await bcrypt.compare(contrasena, contrasenaBD);
}

export const generateJWTToken = async (nombre, correo, rol_id) => {
    return await jwt.sign({ nombre: nombre, correo: correo, rol: rol_id }, config.SECRET, {
        expiresIn: 43200
    });
}