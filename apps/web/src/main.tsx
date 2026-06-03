import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppQueryProvider } from "./providers/QueryProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AppQueryProvider>
      <App />
    </AppQueryProvider>
  </React.StrictMode>
);
