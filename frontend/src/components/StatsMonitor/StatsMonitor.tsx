import { useState, useEffect } from "react";
import { initializeSocket } from "../../utilities/socketController";

import { BACKEND_URL } from "../../config/config";
import StatChart from "./StatChart"; // Import the graph generator function
import Button from "../Button/Button";
import "./StatsMonitor.css";

export interface Stats {
  timestamp: string;
  temperature: number;
  cpuUsage: number;
  memoryUsed: number;
  memoryFree: number;
  diskUsed: number;
  diskFree: number;
  networkLatency: number;
}

const StatsMonitor = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [, setSocket] = useState<any>(null);
  const [dataHistory, setDataHistory] = useState<Stats[]>([]);
  const [loadingFullDay, setLoadingFullDay] = useState<boolean>(false); // Flag to manage full day data loading
  const [fullDayView, setFullDayView] = useState<boolean>(false); // Flag to toggle full-day data view

  // Initialize socket with the backend to receive real-time data
  useEffect(() => {
    if (fullDayView) {
      // Si el usuario está viendo los datos de todo el día, desconectar el socket
      return;
    }

    const socketInstance = initializeSocket(BACKEND_URL);
    setSocket(socketInstance);

    socketInstance.on("performanceData", (data: Stats) => {
      if (!loadingFullDay) {
        // Pause updates if full day data is being loaded
        setStats(data);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [loadingFullDay, fullDayView]);

  // Efecto para desconectar el socket cuando fullDayView sea true
  useEffect(() => {
    if (fullDayView) {
      setSocket(null); // Remueve la instancia del socket al activar la vista de todo el día
    }
  }, [fullDayView]);

  // Update data history with the current data
  useEffect(() => {
    if (stats && !loadingFullDay) {
      // Only update if full day data is not being loaded
      setDataHistory((prevHistory) => {
        const updatedHistory = [...prevHistory, stats];

        // Simplify the data if there are too many points
        if (updatedHistory.length > 100) {
          const simplifiedHistory = simplifyData(updatedHistory);
          return simplifiedHistory;
        }

        return updatedHistory;
      });
    }
  }, [stats, loadingFullDay]);

  // Function to simplify data by averaging values
  const simplifyData = (data: Stats[]): Stats[] => {
    const interval = 10; // Number of data points to average (e.g., every 10 points)
    const simplifiedData: Stats[] = [];

    for (let i = 0; i < data.length; i += interval) {
      const chunk = data.slice(i, i + interval);
      const averageStat = chunk.reduce((acc, curr) => {
        return {
          timestamp: acc.timestamp, // Keep the first timestamp as reference
          temperature: acc.temperature + curr.temperature,
          cpuUsage: acc.cpuUsage + curr.cpuUsage,
          memoryUsed: acc.memoryUsed + curr.memoryUsed,
          memoryFree: acc.memoryFree + curr.memoryFree,
          diskUsed: acc.diskUsed + curr.diskUsed,
          diskFree: acc.diskFree + curr.diskFree,
          networkLatency: acc.networkLatency + curr.networkLatency,
        };
      });

      const count = chunk.length;
      simplifiedData.push({
        timestamp: chunk[0].timestamp, // Keep the first timestamp as reference
        temperature: averageStat.temperature / count,
        cpuUsage: averageStat.cpuUsage / count,
        memoryUsed: averageStat.memoryUsed / count,
        memoryFree: averageStat.memoryFree / count,
        diskUsed: averageStat.diskUsed / count,
        diskFree: averageStat.diskFree / count,
        networkLatency: averageStat.networkLatency / count,
      });
    }

    return simplifiedData;
  };

  const renderStat = (
    label: string,
    value: number | undefined,
    unit: string,
    statkey: keyof Stats,
    decimals: number // New parameter for decimals
  ) => (
    <div className="stat-item">
      <div className="stat-text">
        <p>{label}:</p>
        <p>
          {value !== undefined
            ? `${value.toFixed(decimals)} ${unit}`
            : "Loading..."}
        </p>
      </div>
      <div>
        <StatChart
          statKey={statkey}
          dataHistory={dataHistory}
          fullDayView={fullDayView}
        />
      </div>
    </div>
  );

  const activateFullDayData = () => {
    console.log("Activating full day data...");
    setLoadingFullDay(true); // Pause socket updates

    // Clear data history
    setDataHistory([]);

    // Make a call to the backend to get full day data
    fetch(BACKEND_URL + "/api/performance")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching data from backend");
        }
        return response.json();
      })
      .then((data: Stats[]) => {
        setDataHistory(data);
        // console.log("Full day data loaded:", data);
      })
      .catch((error) => {
        console.error("Error fetching full day data:", error);
      })
      .finally(() => {
        setLoadingFullDay(false);
        setFullDayView(true); // Show full day data
      });
  };

  return (
    <div>
      {stats ? (
        <div className="stats-container">
          <h2>CPU Information</h2>
          <div className="cpu-data stats-section">
            {renderStat(
              "Temperature",
              stats.temperature,
              "°C",
              "temperature",
              1
            )}
            {renderStat("CPU Usage", stats.cpuUsage, "%", "cpuUsage", 2)}
          </div>
          <h2>Memory and Disks</h2>
          <div className="memory-data stats-section">
            {renderStat(
              "RAM Used",
              stats.memoryUsed ? stats.memoryUsed / 1024 : undefined, // Convert to GB
              "GB", // Change the unit to GB
              "memoryUsed",
              2
            )}
            {renderStat(
              "RAM Free",
              stats.memoryFree ? stats.memoryFree / 1024 : undefined, // Convert to GB
              "GB", // Change the unit to GB
              "memoryFree",
              2
            )}
            {renderStat(
              "Disk Used",
              stats.diskUsed ? stats.diskUsed / 1024 : undefined, // Convert to GB
              "GB", // Change the unit to GB
              "diskUsed",
              2
            )}
            {renderStat(
              "Disk Free",
              stats.diskFree ? stats.diskFree / 1024 : undefined, // Convert to GB
              "GB", // Change the unit to GB
              "diskFree",
              2
            )}
          </div>

          <h2>Network Data</h2>
          <div className="network-data stats-section">
            {renderStat(
              "Network Latency",
              stats.networkLatency,
              "ms",
              "networkLatency",
              0
            )}
          </div>

          <div className="bottom-right-buttons">
            {/* Button */}
            <Button
              className="button"
              content="See full day data"
              onClick={activateFullDayData}
            ></Button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StatsMonitor;
