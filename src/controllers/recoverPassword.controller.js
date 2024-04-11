import pool from "../postgresql";
import { generarRespuesta } from "../middleware/Respuesta";
import { main } from "../mail/mailconfig";
import { setCodigo } from "../mail/emailCodeRP";
import * as speakeasy from "speakeasy";

export const sendCode = async (request, response) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const { correo } = request.body;

  const res = await pool.query("SELECT correo FROM usuario WHERE correo = $1", [
    correo,
  ]);

  if (res.rows.length > 0) {
    if (res.rows[0].correo === correo) {
      const code = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
        time: 120,
      });

      const mailOptions = {
        from: '"CapiCode 🦦" alexismtz200326@gmail.com',
        to: correo,
        subject: "Reestablecer Contraseña",
        html: setCodigo(code),
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
                null
              )
            );
        })
        .catch((error) => {
          console.log("Ocurrió un error en el sistema.", error);
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
            correo,
            null
          )
        );
    }
  } else {
    response
      .status(200)
      .json(
        generarRespuesta(
          "Exito",
          "El correo electronico no está registrado, verificalo y vuelve a intentarlo.",
          correo,
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
      .status(500)
      .json(generarRespuesta("Error", "Código invalido.", null, null));
  }
};
