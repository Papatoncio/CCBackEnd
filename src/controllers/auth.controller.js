import pool from "../postgresql";
import { generarRespuesta } from "../middleware/Respuesta";
import * as authJWT from "../middleware/authJwt";
import WebSocket from "ws";
import { wss } from "..";
import { setCodigo2FA } from "../mail/emailCode2FA";
import * as speakeasy from "speakeasy";
import { main } from "../mail/mailconfig";

export const signIn = (request, response) => {
  const loginForm = request.body;

  try {
    if (
      loginForm == null &&
      loginForm.correo == null &&
      loginForm.correo == "" &&
      loginForm.contrasena == null &&
      loginForm.contrasena == ""
    ) {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "Las credenciales utilizadas con incorrectas",
            null,
            null
          )
        );
    }

    pool.query(
      "SELECT * FROM usuario WHERE correo = $1",
      [loginForm.correo],
      async (error, res) => {
        if (res.rows.length != 0) {
          const user = res.rows[0];

          const contrasenaCorrecta = await authJWT.comparePassword(
            loginForm.contrasena,
            user.contrasena
          );

          if (contrasenaCorrecta) {
            if (user.estatus_sesion) {
              pool.query(
                "UPDATE usuario SET estatus_sesion = false WHERE correo = $1",
                [loginForm.correo]
              );

              // Broadcast the message to all connected clients
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    "Sesión usuario " +
                    user.correo +
                    " cerrada ~ " +
                    JSON.stringify(user)
                  );
                }
              });

              response
                .status(200)
                .json(
                  generarRespuesta(
                    "Error",
                    "Sesión activa actualmente, se cerraran todaslas sesiones, intentelo nuevamente",
                    null,
                    null
                  )
                );
            } else {
              pool.query(
                "UPDATE usuario SET estatus_sesion = true WHERE correo = $1",
                [loginForm.correo]
              );

              const token = await authJWT.generateJWTToken(
                user.nombre,
                user.correo,
                user.rol_id
              );
              const userData = {
                nombre: user.nombre,
                correo: user.correo,
                rol_id: user.rol_id,
              };

              response
                .status(200)
                .json(
                  generarRespuesta(
                    "Exitó",
                    "Sesión iniciada correctamente",
                    userData,
                    token
                  )
                );
            }
          } else {
            response
              .status(200)
              .json(
                generarRespuesta(
                  "Error",
                  "Las credenciales utilizadas con incorrectas",
                  null,
                  null
                )
              );
          }
        } else {
          response
            .status(200)
            .json(
              generarRespuesta(
                "Error",
                "Las credenciales utilizadas con incorrectas",
                error,
                null
              )
            );
        }
      }
    );
  } catch (error) {
    throw error.message;
  }
};

export const signUp = async (req, response) => {
  const registerForm = req.body;

  try {
    if (
      registerForm == null &&
      registerForm.nombre == null &&
      registerForm.nombre == "" &&
      registerForm.correo == null &&
      registerForm.correo == "" &&
      registerForm.telefono == null &&
      registerForm.telefono == "" &&
      registerForm.contrasena == null &&
      registerForm.contrasena == "" &&
      registerForm.rol_id == null &&
      registerForm.rol_id == 0
    ) {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "Las credenciales ingresadas no son validas",
            null,
            null
          )
        );
    }

    pool.query(
      "SELECT * FROM usuario WHERE correo = $1",
      [registerForm.correo],
      async (error, res) => {
        if (res.rows.length == 0) {
          pool.query(
            "SELECT * FROM rol WHERE id = $1",
            [registerForm.rol_id],
            async (error, res) => {
              if (res.rows.length != 0) {
                pool.query(
                  "INSERT INTO " +
                  "usuario(nombre, correo, telefono, contrasena, rol_id) " +
                  "VALUES($1, $2, $3, $4, $5)",
                  [
                    registerForm.nombre,
                    registerForm.correo,
                    registerForm.telefono,
                    await authJWT.encryptPassword(registerForm.contrasena),
                    registerForm.rol_id,
                  ],
                  async (error, res) => {
                    if (res) {
                      const token = await authJWT.generateJWTToken(
                        registerForm.nombre,
                        registerForm.correo,
                        registerForm.rol_id
                      );

                      response
                        .status(200)
                        .json(
                          generarRespuesta(
                            "Exitó",
                            "Cuenta creada con exito.",
                            res.rows,
                            token
                          )
                        );
                    } else {
                      response
                        .status(200)
                        .json(
                          generarRespuesta(
                            "Error",
                            "Hubo un error al registrar el usuario",
                            error,
                            null
                          )
                        );
                    }
                  }
                );
              } else {
                response
                  .status(200)
                  .json(
                    generarRespuesta(
                      "Error",
                      "No se encontro el rol",
                      error,
                      null
                    )
                  );
              }
            }
          );
        } else {
          response
            .status(200)
            .json(
              generarRespuesta(
                "Error",
                "Este usuario ya se encuentra registrado",
                error,
                null
              )
            );
        }
      }
    );
  } catch (error) {
    throw error.message;
  }
};

export const logOut = async (req, response) => {
  const logOut = req.body;

  try {
    if (logOut == null && logOut.userName == null && logOut.userName == "") {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "Hubo un error al obtener los datos",
            null,
            null
          )
        );
    }

    pool.query(
      "SELECT * FROM usuario WHERE nombre = $1",
      [logOut.userName],
      async (error, res) => {
        if (res.rows.length != 0) {
          try {
            pool.query(
              "UPDATE usuario SET estatus_sesion = false WHERE nombre = $1",
              [logOut.userName]
            );

            response
              .status(200)
              .json(
                generarRespuesta(
                  "Exitó",
                  "Sesión cerrada correctamente",
                  null,
                  null
                )
              );
          } catch (error) {
            throw error.message;
          }
        } else {
          response
            .status(200)
            .json(
              generarRespuesta("Error", "El usuario no existe", error, null)
            );
        }
      }
    );
  } catch (error) {
    throw error.message;
  }
};

export const getEstatusSesion = async (req, response) => {
  const logOut = req.body;

  try {
    try {
      const verifyT = await authJWT.verifyToken(req, response);
      if (verifyT.message === "Unauthorized") {
        return response
          .status(200)
          .json(
            generarRespuesta("Error", "Su sesión ha caducado", false, null, null, true)
          );
      }
    } catch (error) {
      throw error.message;
    }

    if (logOut == null && logOut.userName == null && logOut.userName == "") {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "Hubo un error al obtener los datos",
            null,
            null
          )
        );
    }

    pool.query(
      "SELECT * FROM usuario WHERE nombre = $1",
      [logOut.userName],
      async (error, res) => {
        if (res.rows.length != 0) {
          const user = res.rows[0];
          try {
            if (user.estatus_sesion) {
              response
                .status(200)
                .json(
                  generarRespuesta(
                    "Exitó",
                    "Sesión activa actualmente",
                    user.estatus_sesion,
                    null
                  )
                );
            } else {
              response
                .status(200)
                .json(
                  generarRespuesta(
                    "Exitó",
                    "Sesión cerrada por inició en otro dispositivo",
                    user.estatus_sesion,
                    null
                  )
                );
            }
          } catch (error) {
            throw error.message;
          }
        } else {
          response
            .status(200)
            .json(
              generarRespuesta("Error", "El usuario no existe", error, null)
            );
        }
      }
    );
  } catch (error) {
    throw error.message;
  }
};

export const sendCode = async (request, response) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const codeForm = request.body;

  const res = await pool.query("SELECT * FROM usuario WHERE correo = $1", [
    codeForm.correo,
  ]);

  const contrasenaCorrecta = await authJWT.comparePassword(
    codeForm.contrasena,
    res.rows[0].contrasena
  );

  if (contrasenaCorrecta) {
    if (res.rows.length > 0) {
      if (res.rows[0].twofa) {
        if (res.rows[0].correo === codeForm.correo) {
          const code = speakeasy.totp({
            secret: secret.base32,
            encoding: "base32",
            time: 120,
          });

          const mailOptions = {
            from: '"CapiCode 🦦" alexismtz200326@gmail.com',
            to: codeForm.correo,
            subject: "Autenticación en Dos Pasos",
            html: setCodigo2FA(code),
          };

          await main(mailOptions)
            .then(() => {
              response
                .status(200)
                .json(
                  generarRespuesta(
                    "Exito",
                    "Se envió correctamente el código a tu correo.",
                    secret.base32,
                    null,
                    res.rows[0].twofa
                  )
                );
            })
            .catch((error) => {
              response
                .status(200)
                .json(
                  generarRespuesta(
                    "Error",
                    "Ocurrio un error al enviar el código.",
                    null,
                    null
                  )
                );
            });
        } else {
          response
            .status(200)
            .json(
              generarRespuesta(
                "Exito",
                "El correo electronico no está registrado, verificalo y vuelve a intentarlo.",
                codeForm.correo,
                null
              )
            );
        }
      } else {
        response
          .status(200)
          .json(
            generarRespuesta(
              "Error",
              "Autenticación en dos pasos desactivada",
              codeForm.correo,
              null,
              res.rows[0].twofa
            )
          );
      }
    } else {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "El correo electronico no está registrado, verificalo y vuelve a intentarlo.",
            codeForm.correo,
            null
          )
        );
    }
  } else {
    response
      .status(200)
      .json(
        generarRespuesta(
          "Error",
          "Las credenciales son invalidas",
          codeForm.correo,
          null
        )
      );
  }
};

export const validCode = async (request, response) => {
  const { codigo, secret } = request.body;

  const tokenValidates = speakeasy.totp.verify({
    secret: secret,
    token: codigo,
    encoding: "base32",
    window: 6,
    time: 120,
  });

  if (tokenValidates) {
    response
      .status(200)
      .json(
        generarRespuesta("Exito", "Código validado correctamente.", null, null)
      );
  } else {
    response
      .status(200)
      .json(generarRespuesta("Error", "Código invalido.", null, null));
  }
};

export const extenderSesion = async (request, response) => {
  const esForm = request.body

  try {
    if (esForm == null && esForm.userName == null && esForm.userName == "") {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "Hubo un error al obtener los datos",
            null,
            null
          )
        );
    }

    if (esForm.extender) {
      pool.query("SELECT * FROM usuario WHERE nombre = $1", [
        esForm.userName,
      ], async (error, res) => {
        if (res.rows.length != 0) {
          const user = res.rows[0]

          const token = await authJWT.generateJWTToken(
            user.nombre,
            user.correo,
            user.rol_id
          );

          response
            .status(200)
            .json(
              generarRespuesta("Exito", "Sesión extendida correctamente.", null, token)
            );
        } else {
          response
            .status(200)
            .json(
              generarRespuesta("Error", "Ha ocurrido un erro al extender la sesión.", null, null)
            );
        }
      });
    } else {
      response
        .status(200)
        .json(
          generarRespuesta("Exito", "La sesión se ha cerrado correctamente.", null, null)
        );

      pool.query(
        "UPDATE usuario SET estatus_sesion = false WHERE nombre = $1",
        [esForm.userName]
      );
    }
  } catch (error) {
    throw error.message;
  }
}