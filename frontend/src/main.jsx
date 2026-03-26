import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GameProvider } from "./store/gameStore.jsx";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
