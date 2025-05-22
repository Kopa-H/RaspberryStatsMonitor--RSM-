import cron from 'node-cron';
import { clearDatabase } from '../database/databaseController.mjs';

import dotenv from 'dotenv';
dotenv.config();
import { sendTelegramMessage } from '../../../kopahub_manager/bots/senderBot.mjs';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const horas = ['30 0 * * *', '30 6 * * *', '30 12 * * *', '30 18 * * *'];

// Programar la tarea cron para limpiar la base de datos cada 6 horas
horas.forEach((cronTime) => {
    cron.schedule(cronTime, async () => {
        try {
            console.log(`Ejecutando limpieza de la base de datos a las ${cronTime}...`);
            await sendTelegramMessage(`Ejecutando limpieza de la base de datos a las ${cronTime}...`, telegramBotToken, chatId);

            clearDatabase();
        } catch (error) {
            console.error('Error durante la limpieza de la base de datos:', error.message);
            await sendTelegramMessage(`Error durante la limpieza de la base de datos: ${error.message}`);
        }
    });
});