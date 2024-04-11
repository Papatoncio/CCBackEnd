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

export const updateUser = async (request, response) => {
  const updateForm = request.body;

  try {
    if (updateForm == null &&
      updateForm.correo == null &&
      updateForm.correo == '' &&
      updateForm.userName == null &&
      updateForm.userName == '' &&
      updateForm.telefono == null &&
      updateForm.telefono == '' &&
      updateForm.twofa == null &&
      updateForm.twofa == '') {

      return response.status(200).json(generarRespuesta(
        "Error",
        "Las credenciales utilizadas con incorrectas",
        null,
        null
      ));
    }

    const user = await pool.query(
      "SELECT * FROM usuario WHERE correo = $1",
      [updateForm.correo]
    );

    if (user.rows.length != 0) {
      const resp = await pool.query(
        "UPDATE usuario SET nombre = $1, correo = $2, telefono = $3, twofa = $4 WHERE correo = $2",
        [updateForm.userName, updateForm.correo, updateForm.telefono, updateForm.twofa]
      );

      if (resp) {
        return response
          .status(200)
          .json(
            generarRespuesta(
              "Exito",
              "Se han actualizado los datos correctamente",
              null,
              null
            )
          );
      } else {
        return response
          .status(200)
          .json(
            generarRespuesta(
              "Error",
              "Ocurrió un error al actualizar los datos.",
              null,
              null
            )
          );
      }
    }
  } catch (error) {
    throw (error.message);
  }
};

export const getUser = async (request, response) => {
  const updateForm = request.body;
  console.log(updateForm);

  try {
    if (updateForm == null &&
      updateForm.userName == null &&
      updateForm.userName == ''
    ) {

      return response.status(200).json(generarRespuesta(
        "Error",
        "No se encontro el usuario",
        null,
        null
      ));
    }

    const user = await pool.query(
      "SELECT * FROM usuario WHERE nombre = $1",
      [updateForm.userName]
    );

    if (user.rows.length != 0) {
      return response
        .status(200)
        .json(
          generarRespuesta(
            "Exito",
            "Datos obtenidos correctamente",
            user.rows[0],
            null
          )
        );
    } else {
      return response
        .status(200)
        .json(
          generarRespuesta(
            "Error",
            "No se encontro al usuario.",
            null,
            null
          )
        );
    }
  } catch (error) {
    throw (error.message);
  }
};
