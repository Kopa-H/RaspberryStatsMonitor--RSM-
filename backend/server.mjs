import app from './middleware/middleware.mjs';
import http from 'http';
import chalk from 'chalk';
import performanceRouter from './routes/utilities.mjs';
import { fetchPerformanceMetrics } from './controllers/fetchPerformanceMetrics.mjs';
import { initDatabase, insertPerformanceData, cleanDatabase } from './database/databaseController.mjs';
import { initializeWebSocket } from './controllers/websocket.mjs';
import "./controllers/cronTasks.mjs";
import { sendTelegramMessage } from './controllers/botManager.mjs';

const PORT = 5001;
const TIME_BETWEEN_DATA_STORAGE = 3 * 60 * 1000;  // x min * 60 seg/min * 1000 ms/seg

// Crear servidor HTTP a partir de Express
const server = http.createServer(app);

// RUTAS
app.use('/api', performanceRouter);

// INICIAR EL SERVIDOR
server.listen(PORT, () => {
  console.log(chalk.blue(`Servidor Express escuchando en ${PORT}`));
});

// Iniciar la conexión a la base de datos
initDatabase();
// Por si se ha saltado el reseteo, se limpian los datos del día anterior (no se restablecen índices):
cleanDatabase();

// Inicializar WebSocket
initializeWebSocket(server);

// Cada X minutos se almacenan los datos de rendimiento en la base de datos (independientemente del frontend)
setInterval(async () => {
  try {
    const performanceData = await fetchPerformanceMetrics();
    insertPerformanceData(performanceData);
  } catch (error) {
    sendTelegramMessage(`Error al obtener datos de rendimiento: ${error.message}`);
    console.error(error);
  }
}, TIME_BETWEEN_DATA_STORAGE);