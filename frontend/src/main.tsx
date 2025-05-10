import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx"; // Asegúrate de que la ruta sea correcta

// Verifica que el elemento con id "root" exista en tu archivo HTML
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
