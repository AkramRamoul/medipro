import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import path from "path";
import { app } from "electron";
import fs from "fs";
import { pathToFileURL } from "url";

const isDevelopment = !app.isPackaged;

const dbDestination = isDevelopment
  ? "D:/Doc/database.db"
  : path.join(app.getPath("userData"), "database.db");

const dbSource = path.join(process.resourcesPath, "database.db");

if (!isDevelopment) {
  if (!fs.existsSync(dbDestination)) {
    fs.copyFileSync(dbSource, dbDestination);
  }

  try {
    fs.chmodSync(dbDestination, 0o666);
  } catch (err) {
    console.error("❌ Failed to set database permissions:", err);
  }
}

const dbUrl = pathToFileURL(dbDestination).href;

export const db = drizzle(
  createClient({
    url: dbUrl,
    syncUrl: undefined,
  }),
);
