import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorPage from "./routes/Error.tsx";
import App from "./App.tsx";
import "./global.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
