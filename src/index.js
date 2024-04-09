import app from "./app"; //Importación de configuraciones de la aplicación
import WebSocket from "ws";

// Initialize WebSocket server
export const wss = new WebSocket.Server({ port: 8080 });

// WebSocket event handling
wss.on('connection', (ws) => {
    console.log('A new client connected.');

    // Event listener for incoming messages
    ws.on('message', (message) => {
        console.log('Received message:', message.toString());

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // Event listener for client disconnection
    ws.on('close', () => {
        console.log('A client disconnected.');
    });
});

app.listen(app.get('port')); //Configuración de puerto de escucha
console.log("Server on port", app.get('port')); //Mensaje para indicar en que puerto se encuentra el servidor