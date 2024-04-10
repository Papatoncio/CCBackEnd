import pool from "../postgresql";
import { generarRespuesta } from "../middleware/Respuesta";
import * as authJWT from "../middleware/authJwt";

/**
 * @author AlexRGB2
 * @description Método que actualiza la contraseña del usuario.
 * @param  request - Información que recibe el servidor.
 * @param  response - Respuesta que enviara el servidor.
 */
export const updatePassword = async (request, response) => {
  const { correo, password } = request.body;

  const user = await pool.query(
    "SELECT contrasena FROM usuario WHERE correo = $1",
    [correo]
  );

  const isEquals = await authJWT.comparePassword(
    password,
    user.rows[0].contrasena
  );

  if (isEquals) {
    response
      .status(500)
      .json(
        generarRespuesta(
          "Error",
          "La contraseña no puede ser igual a la anterior.",
          null,
          null
        )
      );
  } else {
    const resp = await pool.query(
      "UPDATE usuario SET contrasena = $1 WHERE correo = $2",
      [await authJWT.encryptPassword(password), correo]
    );

    if (resp) {
      response
        .status(200)
        .json(
          generarRespuesta(
            "Exito",
            "Se reestablecio correctamente la contraseña",
            null,
            null
          )
        );
    } else {
      response
        .status(500)
        .json(
          generarRespuesta(
            "Error",
            "Ocurrió un error al actualizar la contraseña.",
            null,
            null
          )
        );
    }
  }
};
