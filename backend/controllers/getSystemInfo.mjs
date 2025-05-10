import { exec } from 'child_process';

// Función para obtener la temperatura
export const getTemperature = (callback) => {
  exec('sudo vcgencmd measure_temp', (error, stdout) => {
    if (error) {
      console.error(`Error ejecutando el comando de temperatura: ${error.message}`);
      return callback(null); // Si hay error, retorna null
    }
    const temp = stdout.replace('temp=', '').replace("'C", '');
    const temperature = parseFloat(temp);
    callback(temperature);
  });
};

// Función para obtener memoria utilizada
export const getMemoryUsage = (callback) => {
  exec('sudo free -m', (error, stdout) => {
    if (error) {
      console.error(`Error ejecutando el comando para memoria: ${error.message}`);
      return callback(null, null, null); // Si hay error, retorna valores nulos
    }
    const lines = stdout.trim().split('\n');
    const memoryInfo = lines[1].split(/\s+/);
    const memoryUsed = parseInt(memoryInfo[2], 10);   // Memoria utilizada en MB
    const memoryFree = parseInt(memoryInfo[3], 10);   // Memoria libre en MB
    callback(memoryUsed, memoryFree);
  });
};

// Función para obtener el uso del disco
export const getDiskUsage = (callback) => {
  exec('sudo df -m /', (error, stdout) => {
    if (error) {
      console.error(`Error ejecutando el comando para disco: ${error.message}`);
      return callback(null, null, null); // Si hay error, retorna valores nulos
    }
    const lines = stdout.trim().split('\n');
    const diskInfo = lines[1].split(/\s+/);
    const diskUsed = parseInt(diskInfo[2], 10);  // Disco utilizado en MB
    const diskFree = parseInt(diskInfo[3], 10);  // Disco libre en MB
    callback(diskUsed, diskFree);
  });
};

// Función para obtener la latencia de red
export const getNetworkLatency = (callback) => {
  exec('sudo ping -c 1 google.com', (error, stdout) => {
      if (error) {
          console.error(`Error ejecutando el comando de latencia de red: ${error.message}`);
          return callback(null); // Si hay error, retorna null
      }
      const timeMatch = stdout.match(/time=(\d+\.\d+) ms/);
      if (timeMatch) {
          const networkLatency = parseFloat(timeMatch[1]); // Obtiene la latencia en ms
          callback(networkLatency);
      } else {
          callback(null);
      }
  });
};