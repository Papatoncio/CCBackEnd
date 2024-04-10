//Importación de modulos npm (express, morgan, cors)
import express from "express";
import morgan from "morgan";
import cors from "cors";

import Auth from "../src/routes/auth.routes";
import Recover from "../src/routes/recoverPassword.routes";
import User from "../src/routes/user.routes";

//Importación de rutas para cada colección de la base de datos

const app = express(); //Definición de constante para configurar la aplicación

//Definición de puerto en el que va a correr el servidor
app.set("port", process.env.PORT || 3000);

//Uso de modulos npm (express, morgan, cors)
app.use(express.json({ limit: "1000mb" })); //Definir uso de json en express
app.use(morgan("dev")); //Definir dev con morgan
app.use(cors()); //Definir uso de cors

//Rutas
//Ruta raíz del servidor
app.get("/", (req, res) => {
  res.json({ message: "Welcome to my application" });
});

app.use("/api/auth", Auth);
app.use("/api/mail", Recover);
app.use("/api/user", User);

//Exportación de la configuración
export default app;
