import pool from "../postgresql"
import { generarRespuesta } from "../middleware/Respuesta";
import * as authJWT from "../middleware/authJwt";
import WebSocket from "ws";
import { wss } from "..";

export const signIn = (request, response) => {
    const loginForm = request.body;

    try {
        if (loginForm == null &&
            loginForm.correo == null &&
            loginForm.correo == '' &&
            loginForm.contrasena == null &&
            loginForm.contrasena == '') {

            response.status(200).json(generarRespuesta(
                "Error",
                "Las credenciales utilizadas con incorrectas",
                null,
                null
            ));
        }

        pool.query('SELECT * FROM usuario WHERE correo = $1', [loginForm.correo], async (error, res) => {
            if (res.rows.length != 0) {
                const user = res.rows[0];

                const contrasenaCorrecta =
                    await authJWT.comparePassword(loginForm.contrasena, user.contrasena);

                if (contrasenaCorrecta) {
                    if (user.estatus_sesion) {
                        pool.query('UPDATE usuario SET estatus_sesion = false WHERE correo = $1', [loginForm.correo]);

                        // Broadcast the message to all connected clients
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send("Sesión usuario " + user.correo + " cerrada ~ " + JSON.stringify(user));
                            }
                        });

                        response.status(200).json(generarRespuesta(
                            "Error",
                            "Sesión activa actualmente, se cerraran todaslas sesiones, intentelo nuevamente",
                            null,
                            null
                        ));
                    } else {
                        pool.query('UPDATE usuario SET estatus_sesion = true WHERE correo = $1', [loginForm.correo]);

                        const token = await authJWT.generateJWTToken(user.nombre, user.correo, user.rol_id);
                        const userData = {
                            nombre: user.nombre,
                            correo: user.correo,
                            rol_id: user.rol_id
                        }

                        response.status(200).json(generarRespuesta(
                            "Exitó",
                            "Sesión iniciada correctamente",
                            userData,
                            token
                        ));
                    }
                } else {
                    response.status(200).json(generarRespuesta(
                        "Error",
                        "Las credenciales utilizadas con incorrectas",
                        null,
                        null
                    ));
                }
            } else {
                response.status(200).json(generarRespuesta(
                    "Error",
                    "Las credenciales utilizadas con incorrectas",
                    error,
                    null
                ));
            }
        });


    } catch (error) {
        throw (error.message);
    }
}

export const signUp = async (req, response) => {
    const registerForm = req.body;

    try {
        if (
            registerForm == null &&
            registerForm.nombre == null &&
            registerForm.nombre == '' &&
            registerForm.correo == null &&
            registerForm.correo == '' &&
            registerForm.telefono == null &&
            registerForm.telefono == '' &&
            registerForm.contrasena == null &&
            registerForm.contrasena == '' &&
            registerForm.rol_id == null &&
            registerForm.rol_id == 0
        ) {
            response.status(200).json(generarRespuesta(
                "Error",
                "Las credenciales ingresadas no son validas",
                null,
                null
            ));
        }

        pool.query('SELECT * FROM usuario WHERE correo = $1', [registerForm.correo], async (error, res) => {
            if (res.rows.length == 0) {
                pool.query('SELECT * FROM rol WHERE id = $1', [registerForm.rol_id], async (error, res) => {
                    if (res.rows.length != 0) {
                        pool.query('INSERT INTO ' +
                            'usuario(nombre, correo, telefono, contrasena, rol_id) ' +
                            'VALUES($1, $2, $3, $4, $5)',
                            [
                                registerForm.nombre,
                                registerForm.correo,
                                registerForm.telefono,
                                await authJWT.encryptPassword(registerForm.contrasena),
                                registerForm.rol_id
                            ],
                            async (error, res) => {
                                if (res) {
                                    const token = await authJWT.generateJWTToken(registerForm.nombre, registerForm.correo, registerForm.rol_id);

                                    response.status(200).json(generarRespuesta(
                                        "Exitó",
                                        "Sesión iniciada correctamente",
                                        res.rows,
                                        token
                                    ));
                                } else {
                                    response.status(200).json(generarRespuesta(
                                        "Error",
                                        "Hubo un error al registrar el usuario",
                                        error,
                                        null
                                    ));
                                }
                            });

                    } else {
                        response.status(200).json(generarRespuesta(
                            "Error",
                            "No se encontro el rol",
                            error,
                            null
                        ));
                    }
                });
            } else {
                response.status(200).json(generarRespuesta(
                    "Error",
                    "Este usuario ya se encuentra registrado",
                    error,
                    null
                ));
            }
        });
    } catch (error) {
        throw (error.message);
    }
}

export const logOut = async (req, response) => {
    const logOut = req.body;

    try {
        if (
            logOut == null &&
            logOut.userName == null &&
            logOut.userName == ''
        ) {
            response.status(200).json(generarRespuesta(
                "Error",
                "Hubo un error al obtener los datos",
                null,
                null
            ));
        }

        pool.query('SELECT * FROM usuario WHERE nombre = $1', [logOut.userName], async (error, res) => {
            if (res.rows.length != 0) {
                try {
                    pool.query('UPDATE usuario SET estatus_sesion = false WHERE nombre = $1', [logOut.userName]);

                    response.status(200).json(generarRespuesta(
                        "Exitó",
                        "Sesión cerrada correctamente",
                        null,
                        null
                    ));
                } catch (error) {
                    throw (error.message);
                }
            } else {
                response.status(200).json(generarRespuesta(
                    "Error",
                    "El usuario no existe",
                    error,
                    null
                ));
            }
        }
        )
    } catch (error) {
        throw (error.message);
    }
}

export const getEstatusSesion = async (req, response) => {
    const logOut = req.body;

    try {
        if (
            logOut == null &&
            logOut.userName == null &&
            logOut.userName == ''
        ) {
            response.status(200).json(generarRespuesta(
                "Error",
                "Hubo un error al obtener los datos",
                null,
                null
            ));
        }

        pool.query('SELECT * FROM usuario WHERE nombre = $1', [logOut.userName], async (error, res) => {
            if (res.rows.length != 0) {
                const user = res.rows[0];
                try {
                    response.status(200).json(generarRespuesta(
                        "Exitó",
                        "Estatus sesión",
                        user.estatus_sesion,
                        null
                    ));
                } catch (error) {
                    throw (error.message);
                }
            } else {
                response.status(200).json(generarRespuesta(
                    "Error",
                    "El usuario no existe",
                    error,
                    null
                ));
            }
        }
        )
    } catch (error) {
        throw (error.message);
    }
}