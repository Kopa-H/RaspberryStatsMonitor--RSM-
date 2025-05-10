import { useEffect, useRef, FC } from "react";
import { Stats } from "./StatsMonitor";
import { Line } from "react-chartjs-2"; // Import the Line Chart component
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js"; // Import Filler

// Register necessary elements for Chart.js
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
); // Register Filler

interface StatChartProps {
  statKey: keyof Stats; // Cambia "key" a "statKey"
  dataHistory: Stats[]; // El historial de datos es un array de Stat
  fullDayView: boolean; // Vista de día completo o vista reducida
}

// Función pura fuera del componente
export const getChartData = ({
  statKey,
  dataHistory,
  fullDayView,
}: StatChartProps) => {
  const labels = fullDayView
    ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
    : dataHistory.map(() => "");

  const dataPoints = fullDayView
    ? labels.map((_, index) => {
        const stat = dataHistory.find(
          (s) => new Date(s.timestamp).getHours() === index
        );
        return stat ? stat[statKey] : null;
      })
    : dataHistory.map((stat) => stat[statKey]);

  return {
    labels,
    datasets: [
      {
        label: statKey,
        data: dataPoints,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        responsive: true,
        maintainAspectRatio: false,
      },
    ],
  };
};

// Componente que usa la función
const StatChart: FC<StatChartProps> = ({
  statKey,
  dataHistory,
  fullDayView,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        (chartRef.current as any).resize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "20rem" }}>
      <Line
        data={getChartData({ statKey, dataHistory, fullDayView })}
        options={{
          responsive: true, // Hacer que el gráfico sea responsive
          maintainAspectRatio: false, // Evitar mantener la relación de aspecto
        }}
      />
    </div>
  );
};

export default StatChart;
