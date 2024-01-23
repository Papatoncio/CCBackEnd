import app from "./app"; //Importación de configuraciones de la aplicación

app.listen(app.get('port')); //Configuración de puerto de escucha
console.log("Server on port", app.get('port')); //Mensaje para indicar en que puerto se encuentra el servidor