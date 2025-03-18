import { app } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";

export function getPreloadPath() {
  return isDevelopment()
    ? path.join(app.getAppPath(), "dist-electron", "preload.cjs")
    : path.join(process.resourcesPath, "dist-electron", "preload.cjs");
}

export function getMedsPath() {
  return path.join(
    app.getAppPath(),
    isDevelopment() ? "public" : path.join("resources", "public"),
    "meds.json"
  );
}
