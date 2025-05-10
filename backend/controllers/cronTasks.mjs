import cron from 'node-cron';
import { clearDatabase } from '../database/databaseController.mjs';
import { sendTelegramMessage } from './botManager.mjs';

// Programar una tarea diaria que se ejecuta a las 00:05
cron.schedule('5 0 * * *', async () => {
    try {
        console.log('Ejecutando limpieza diaria de la base de datos...');
        await sendTelegramMessage('Ejecutando limpieza diaria de la base de datos...');

        clearDatabase();
    } catch (error) {
        console.error('Error durante la limpieza diaria de la base de datos:', error.message);
        await sendTelegramMessage(`Error durante la limpieza diaria de la base de datos: ${error.message}`);
    }
});