import osUtils from 'os-utils';
import { getTemperature, getMemoryUsage, getDiskUsage, getNetworkLatency } from './getSystemInfo.mjs';

import dotenv from 'dotenv';
dotenv.config();
import { sendTelegramMessage } from '../../../kopahub_manager/bots/senderBot.mjs';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Función para obtener métricas de rendimiento constantemente
export const getConstantPerformanceMetrics = async (socket) => {
  if (!socket) {
    console.error("Socket no definido");
    await sendTelegramMessage("Error: Socket no definido", telegramBotToken, chatId);
    return;
  }

  try {
    const performanceData = await fetchPerformanceMetrics();
    socket.emit('performanceData', performanceData);
  } catch (error) {
    console.error(error);
    await sendTelegramMessage(`Error en getConstantPerformanceMetrics: ${error.message}`, telegramBotToken, chatId);
  }
};

// Función para obtener todas las métricas de rendimiento en paralelo
export const fetchPerformanceMetrics = async () => {
  try {
    const temperaturePromise = getTemperatureAsync();
    const cpuUsagePromise = getCpuUsageAsync();
    const memoryUsagePromise = getMemoryUsageAsync();
    const diskUsagePromise = getDiskUsageAsync();
    const networkLatencyPromise = getNetworkLatencyAsync();

    // Esperar a que todas las promesas terminen en paralelo
    const [temperature, cpuUsage, { memoryUsed, memoryFree }, { diskUsed, diskFree }, networkLatency] =
      await Promise.all([temperaturePromise, cpuUsagePromise, memoryUsagePromise, diskUsagePromise, networkLatencyPromise]);

    if (temperature === null) {
      throw new Error('Error obteniendo la temperatura');
    }

    return {
      timestamp: Date.now(),
      temperature,
      cpuUsage,
      memoryUsed,
      memoryFree,
      diskUsed,
      diskFree,
      networkLatency,
    };
  } catch (error) {
    console.error("Error en fetchPerformanceMetrics:", error);
    await sendTelegramMessage(`Error en fetchPerformanceMetrics: ${error.message}`, telegramBotToken, chatId);
    throw error;
  }
};

// Funciones auxiliares para envolver las funciones callback-based en promesas
const getTemperatureAsync = () => {
  return new Promise((resolve, reject) => {
    getTemperature((temperature) => {
      if (temperature === null) {
        const errorMsg = 'Error obteniendo la temperatura';
        console.error(errorMsg);
        sendTelegramMessage(errorMsg, telegramBotToken, chatId);  // Log del error en Telegram
        reject(errorMsg);
      } else {
        resolve(temperature);
      }
    });
  });
};

const getCpuUsageAsync = () => {
  return new Promise((resolve) => {
    osUtils.cpuUsage((cpuPercent) => resolve(cpuPercent * 100));
  });
};

const getMemoryUsageAsync = () => {
  return new Promise((resolve) => {
    getMemoryUsage((memoryUsed, memoryFree) => resolve({ memoryUsed, memoryFree }));
  });
};

const getDiskUsageAsync = () => {
  return new Promise((resolve) => {
    getDiskUsage((diskUsed, diskFree) => resolve({ diskUsed, diskFree }));
  });
};

const getNetworkLatencyAsync = () => {
  return new Promise((resolve) => {
    getNetworkLatency((networkLatency) => resolve(networkLatency));
  });
};
