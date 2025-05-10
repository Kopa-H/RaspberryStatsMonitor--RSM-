import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (url: string): Socket => {
    socket = io(url, {
        reconnectionAttempts: 5, // Intentos de reconexión
        reconnectionDelay: 1000, // Retraso entre intentos de reconexión
        timeout: 2000, // Tiempo de espera antes de dar por fallida la conexión
    });

    socket.on('connect', () => {
        console.log('Connection established with the WebSocket server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the WebSocket server');
    });

    return socket;
};