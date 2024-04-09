import app from "./app"; //Importación de configuraciones de la aplicación
import WebSocket from "ws";

const url = 'ws://localhost:8080'
const connection = new WebSocket(url)
connection.onopen = () => {
    connection.send('Message From Client')
}
connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`)
}
connection.onmessage = (e) => {
    console.log(e.data)
}

app.listen(app.get('port')); //Configuración de puerto de escucha
console.log("Server on port", app.get('port')); //Mensaje para indicar en que puerto se encuentra el servidor