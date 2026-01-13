import path from "path";
import { app } from "electron";
import fs from "fs";
import { pathToFileURL } from "url";

const isDevelopment = !app.isPackaged;

const dbDestination = isDevelopment
  ? "D:/Doc/database.db"
  : path.join(app.getPath("userData"), "database.db");

const dbSource = path.join(process.resourcesPath, "database.db");

if (!isDevelopment && !fs.existsSync(dbDestination)) {
  fs.copyFileSync(dbSource, dbDestination);
  fs.chmodSync(dbDestination, 0o666);
}

export const dbUrl = pathToFileURL(dbDestination).href;
export const dbPath = dbDestination;
