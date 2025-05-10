import { Server } from 'socket.io';
import { getConstantPerformanceMetrics } from './fetchPerformanceMetrics.mjs';
import chalk from 'chalk';

let io = null;  // Variable para el servidor WebSocket
const TIME_BETWEEN_EMISSIONS = 5 * 1000;  // Tiempo entre emisiones de datos

export const initializeWebSocket = (server) => {
  console.log(chalk.magenta("\nInicializando WebSocket..."));

  io = new Server(server, {
    cors: {
      origin: '*',  // Permitir conexiones desde cualquier origen, modificar si es necesario
    }
  });

  // Configurar el evento de conexión para los clientes WebSocket
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Emitir los datos de rendimiento inmediatamente
    getConstantPerformanceMetrics(socket);  // Emite los datos de inmediato

    // Emitir datos de rendimiento continuamente cada X segundos
    const intervalId = setInterval(() => {
      getConstantPerformanceMetrics(socket);  // Pasa el socket a la función
    }, TIME_BETWEEN_EMISSIONS);

    // Manejar desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
      clearInterval(intervalId);  // Detener el intervalo al desconectar
    });
  });
};
