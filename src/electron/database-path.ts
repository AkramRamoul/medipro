import path from "path";
import { app } from "electron";
import fs from "fs";
import { pathToFileURL } from "url";

const isDevelopment = !app.isPackaged;

const userDataPath = app.getPath("userData");
const dbDestination = isDevelopment
  ? "D:/Doc/database.db"
  : path.join(userDataPath, "database.db");

const dbSource = path.join(process.resourcesPath, "database.db");

if (!isDevelopment) {
  try {
    const dbDir = path.dirname(dbDestination);
    if (!fs.existsSync(dbDir)) {
      console.log("Creating database directory:", dbDir);
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(dbDestination)) {
      console.log(`Copying database from ${dbSource} to ${dbDestination}`);
      fs.copyFileSync(dbSource, dbDestination);
      fs.chmodSync(dbDestination, 0o666);
    }
  } catch (err) {
    console.error("❌ Critical Database Initialization Error:", err);
    // On some Windows machines, copyFileSync might fail due to EPERM if the file is locked
    // or if the directory isn't fully accessible yet.
  }
}

export const dbUrl = pathToFileURL(dbDestination).href;
export const dbPath = dbDestination;
