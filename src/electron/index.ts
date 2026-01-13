import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import path from "path";
import { app } from "electron";
import fs from "fs";
import { pathToFileURL } from "url";

const isDevelopment = !app.isPackaged;

// ✅ Use "D:/Doc/database.db" in development
const dbDestination = isDevelopment
  ? "D:/Doc/database.db"
  : path.join(app.getPath("userData"), "database.db");

const dbSource = path.join(process.resourcesPath, "database.db");

// Ensure the database exists in production
if (!isDevelopment) {
  if (!fs.existsSync(dbDestination)) {
    fs.copyFileSync(dbSource, dbDestination);
    console.log("✅ Database copied to:", dbDestination);
  }

  //  Explicitly set file permissions to make it writable
  try {
    fs.chmodSync(dbDestination, 0o666);
    console.log("✅ Database permissions updated");
  } catch (err) {
    console.error("❌ Failed to set database permissions:", err);
  }
}

// Convert to file URL
const dbUrl = pathToFileURL(dbDestination).href;

console.log("Using database URL:", dbUrl);

//  Initialize Drizzle
export const db = drizzle(
  createClient({
    url: dbUrl,
    syncUrl: undefined,
  })
);
