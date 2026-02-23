import { app } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";

export function getPreloadPath() {
  return isDevelopment()
    ? path.join(app.getAppPath(), "dist-electron", "preload.cjs")
    : path.join(process.resourcesPath, "dist-electron", "preload.cjs");
}

export function getMedsPath() {
  if (isDevelopment()) {
    return path.join(app.getAppPath(), "public", "meds.json");
  }
  return path.join(app.getPath("userData"), "meds.json");
}

export function getBilansPath() {
  if (isDevelopment()) {
    return path.join(app.getAppPath(), "public", "common_bilans.json");
  }
  return path.join(app.getPath("userData"), "common_bilans.json");
}

export function getConsultationsPath() {
  if (isDevelopment()) {
    return path.join(app.getAppPath(), "public", "common_consultations.json");
  }
  return path.join(app.getPath("userData"), "common_consultations.json");
}

export function getfontPath() {
  return isDevelopment()
    ? path.join(app.getAppPath(), "public/fonts")
    : path.join(process.resourcesPath, "public");
}
