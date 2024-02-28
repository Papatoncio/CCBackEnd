import pool from "../postgresql"
import { generarRespuesta } from "../middleware/Respuesta";
import * as authJWT from "../middleware/authJwt";

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