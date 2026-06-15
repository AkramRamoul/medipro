// Polyfill Zod v4 compatibility with @hookform/resolvers (zodResolver)
if (typeof Error !== "undefined" && !("errors" in Error.prototype)) {
  Object.defineProperty(Error.prototype, "errors", {
    get() {
      return (this as any).issues;
    },
    configurable: true,
  });
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
