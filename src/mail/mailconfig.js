import { createTransport } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const serverCorreo = createTransport({
  host: process.env.MAILHOST,
  port: process.env.MAILPORT,
  secure: true,
  auth: {
    user: process.env.MAILUSER,
    pass: process.env.MAILPASS,
  },
});

export async function main(mailOptions) {
  const info = await serverCorreo.sendMail(mailOptions);
}
