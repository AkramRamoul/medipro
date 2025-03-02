import { app } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDevelopment() ? "." : "..",
    "/dist-electron/preload.cjs"
  );
}
