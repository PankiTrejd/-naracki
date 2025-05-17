import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Initialize TempoDevtools
const initTempoDevtools = async () => {
  try {
    const { TempoDevtools } = await import("tempo-devtools");
    TempoDevtools.init();
  } catch (error) {
    console.error("Failed to initialize TempoDevtools:", error);
  }
};

// Initialize the app
const initApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render app:", error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px;">
      Failed to render app. Please check the console for errors.
    </div>`;
  }
};

// Start the app
initTempoDevtools().then(() => {
  initApp();
});
