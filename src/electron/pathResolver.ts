import { app } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";

export function getPreloadPath() {
  return isDevelopment()
    ? path.join(app.getAppPath(), "dist-electron", "preload.cjs")
    : path.join(process.resourcesPath, "dist-electron", "preload.cjs");
}

export function getMedsPath() {
  return isDevelopment()
    ? "public/meds.json"
    : path.join(process.resourcesPath, "meds.json");
}

export function getBilansPath() {
  return isDevelopment()
    ? "public/common_bilans.json"
    : path.join(process.resourcesPath, "common_bilans.json");
}

export function getfontPath() {
  return isDevelopment()
    ? path.join(app.getAppPath(), "public/fonts")
    : path.join(process.resourcesPath, "public");
}
