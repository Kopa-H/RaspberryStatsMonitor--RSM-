import sqlite3 from 'sqlite3';
import { stat } from 'fs';
import os from 'os';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();
import { sendTelegramMessage } from '../../../kopahub_manager/bots/senderBot.mjs';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

import chalk from 'chalk';

const { red, green } = chalk;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define las rutas para cada sistema
const windowsDBPath = path.join(__dirname, 'dailyPerformanceStats.db'); // Ruta en Windows
const raspberryDBPath = '/media/mydisk/Raspberry_Stats_Display/dailyPerformanceStats.db'; // Ruta en la Raspberry Pi (en el disco duro externo)

// Detectar la plataforma
const isRaspberry = os.platform() === 'linux';
const dbPath = isRaspberry ? raspberryDBPath : windowsDBPath;

// Ahora puedes usar `dbPath` en tu código donde sea que se necesite acceder a la base de datos
console.log(`Base de datos en uso:
    -URL: ${dbPath}
    -Sistema operativo: ${os.platform()}`);

// Función para inicializar la base de datos
export function initDatabase() {
    // Verificar si el archivo de la base de datos existe
    stat(dbPath, (err, stats) => {
        if (err) {
            // Si el archivo no existe, se crea la base de datos
            if (err.code === 'ENOENT') {
                console.log(green('La base de datos no existe, se procederá a crearla.'));

                // Crear conexión a la base de datos
                const db = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        sendTelegramMessage(`Error al conectar a la base de datos: ${err.message}`, telegramBotToken, chatId);
                        return console.error(red('Error al conectar a la base de datos:', err.message));
                    }
                    console.log(green('Conexión a la base de datos establecida.'));
                });

                // Crear tabla si no existe
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS performanceData (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        temperature REAL,
                        cpuUsage REAL,
                        memoryUsed INTEGER,
                        memoryFree INTEGER,
                        diskUsed INTEGER,
                        diskFree INTEGER,
                        networkLatency REAL
                    )`, (err) => {
                        if (err) {
                            console.error(red('Error al crear la tabla:', err.message));
                            sendTelegramMessage(`Error al crear la tabla 'performanceData': ${err.message}`, telegramBotToken, chatId);
                        } else {
                            console.log(green("Tabla 'performanceData' creada con éxito."));
                        }
                    });
                });

                // Cerrar la conexión
                db.close((err) => {
                    if (err) {
                        console.error(red('Error al cerrar la conexión a la base de datos:', err.message));
                    } else {
                        console.log(green('Conexión a la base de datos cerrada.'));
                    }
                });

            } else {
                sendTelegramMessage(`Error al verificar el archivo de la base de datos: ${err.message}`, telegramBotToken, chatId);
                console.error(red('Error al verificar el archivo de la base de datos:', err.message));
            }
        } else {
            // Conexión a la base de datos
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    return console.error(red('Error al conectar a la base de datos:', err.message));
                }
                console.log(green('Conexión de prueba a la base de datos establecida.'));
            });

            // Cerrar la conexión
            db.close((err) => {
                if (err) {
                    console.error(red('Error al cerrar la conexión a la base de datos:', err.message));
                } else {
                    console.log(green('Conexión a la base de datos cerrada.'));
                }
            });
        }
    });
}

// Función para insertar datos en la tabla 'performanceData'
export function insertPerformanceData(data) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return console.error(chalk.red('Error al conectar a la base de datos:', err.message));
        }
        console.log(chalk.green('\nConexión establecida con la database para la inserción de datos.'));
    });

    const { temperature, cpuUsage, memoryUsed, memoryFree, diskUsed, diskFree, networkLatency } = data;

    db.run(`INSERT INTO performanceData (temperature, cpuUsage, memoryUsed, memoryFree, diskUsed, diskFree, networkLatency)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [temperature, cpuUsage, memoryUsed, memoryFree, diskUsed, diskFree, networkLatency],
        function(err) {
            if (err) {
                return console.error(chalk.red('Error al insertar los datos:', err.message));
            }
            console.log(chalk.green(`Datos insertados con éxito con id ${this.lastID}.`));
            // Cada 100 datos insertados, enviar un mensaje a Telegram
            if (this.lastID % 50 === 0) {
                sendTelegramMessage(`Datos de rendimiento insertados en la base de datos con id ${this.lastID}.`, telegramBotToken, chatId);
            }
        }
    );

    db.close((err) => {
        if (err) {
            console.error(chalk.red('Error al cerrar la conexión a la base de datos:', err.message));
        } else {
            console.log(chalk.green('Conexión a la base de datos cerrada.'));
        }
    });
}

// Función para obtener los datos de la tabla 'performanceData'
export function getPerformanceData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(chalk.red('Error al conectar a la base de datos:', err.message));
                return reject(err); // Rechazar promesa si hay error al conectar
            }
            console.log(chalk.green('\nConexión a la base de datos establecida.'));
        });

        // Consulta la tabla 'performanceData'
        db.all(`SELECT * FROM performanceData`, [], (err, rows) => {
            if (err) {
                console.error(chalk.red('Error en la consulta:', err.message));
                // Cerrar la conexión antes de rechazar
                db.close();
                return reject(err); // Rechazar promesa si hay error en la consulta
            }

            // Resolver la promesa con los datos obtenidos
            resolve(rows);

            // Cerrar la conexión después de resolver la promesa
            db.close((closeErr) => {
                if (closeErr) {
                    console.error(chalk.red('Error al cerrar la conexión a la base de datos:', closeErr.message));
                } else {
                    console.log(chalk.green('Conexión a la base de datos cerrada.'));
                }
            });
        });
    });
}

// Función para resetear la base de datos a cero
export function clearDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return console.error(chalk.red('Error al conectar a la base de datos:', err.message));
        }
        console.log(chalk.green('Conexión a la base de datos establecida para resetear la tabla.'));
    });

    // Eliminar y recrear la tabla
    db.serialize(() => {
        db.run(`DROP TABLE IF EXISTS performanceData`, (err) => {
            if (err) {
                const errorMessage = `Error al conectar a la base de datos: ${err.message}`;
                console.error(chalk.red('Error al eliminar la tabla:', err.message));
                sendTelegramMessage(errorMessage, telegramBotToken, chatId);
            } else {
                console.log(chalk.green("Tabla 'performanceData' eliminada con éxito."));
            }
        });

        db.run(`CREATE TABLE performanceData (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperature REAL,
            cpuUsage REAL,
            memoryUsed INTEGER,
            memoryFree INTEGER,
            diskUsed INTEGER,
            diskFree INTEGER,
            networkLatency REAL
        )`, (err) => {
            if (err) {
                const errorMessage = `Error al recrear la base de datos: ${err.message}`;
                console.error(chalk.red('Error al recrear la tabla:', err.message));
            } else {
                console.log(chalk.green("Tabla 'performanceData' recreada con éxito."));
            }
        });

        const successMessage = 'Base de datos vaciada con éxito.';
        sendTelegramMessage(successMessage, telegramBotToken, chatId);
    });

    db.close((err) => {
        if (err) {
            const errorMessage = `Error al cerrar la conexión a la base de datos: ${err.message}`;
            console.error(chalk.red('Error al cerrar la conexión a la base de datos:', err.message));
            sendTelegramMessage(errorMessage, telegramBotToken, chatId);
        } else {
            console.log(chalk.green('Conexión a la base de datos cerrada tras resetear la tabla.'));
        }
    });
}

export function cleanDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            const errorMessage = `Error al conectar a la base de datos: ${err.message}`;
            console.error(chalk.red(errorMessage));
            sendTelegramMessage(errorMessage, telegramBotToken, chatId); // Notificar error al conectar
            return;
        }
        console.log(chalk.green('Conexión a la base de datos establecida para limpiar datos.'));
    });

    // Usar promesas para controlar la ejecución
    const getData = () => new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS count FROM performanceData WHERE timestamp < strftime('%Y-%m-%d 00:00:00', 'now');`, (err, row) => {
            if (err) reject(`Error al contar los datos anteriores al día actual: ${err.message}`);
            resolve(row.count);
        });
    });

    const deleteData = () => new Promise((resolve, reject) => {
        db.run(`DELETE FROM performanceData WHERE timestamp < strftime('%Y-%m-%d 00:00:00', 'now');`, (err) => {
            if (err) reject(`Error al eliminar los datos anteriores al día actual: ${err.message}`);
            resolve('Datos anteriores al día actual eliminados con éxito.');
        });
    });

    const closeDb = () => new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(`Error al cerrar la conexión a la base de datos: ${err.message}`);
            resolve('Conexión a la base de datos cerrada tras limpiar datos.');
        });
    });

    // Comprobar si hay datos anteriores y eliminarlos
    getData()
        .then(async count => {
            if (count === 0) {
                console.log(chalk.yellow('No hay datos anteriores al día actual. No se requiere limpieza.'));
                sendTelegramMessage('No hay datos anteriores al día actual. No se requiere limpieza.', telegramBotToken, chatId);
                return closeDb(); // Cerramos la base de datos
            }

            // Si hay datos anteriores, proceder con la eliminación
            const successMessage = await deleteData();
            console.log(chalk.green(successMessage));
            sendTelegramMessage(successMessage, telegramBotToken, chatId);
            return await closeDb();
        })
        .catch(err => {
            console.error(chalk.red(err));
            sendTelegramMessage(err, telegramBotToken, chatId); // Notificar error
            closeDb(); // Asegurarse de cerrar la base de datos en caso de error
        });
}