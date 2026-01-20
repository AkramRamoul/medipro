import fs from "fs";
import { closeDB, openDB } from "./db.js";
import { dbPath, dbUrl } from "./database-path.js";
import { app } from "electron";

/**
 * @param backupPath absolute path chosen by the user
 */
export async function restoreDatabase(backupPath: string) {
  await closeDB();

  try {
    await new Promise((r) => setTimeout(r, 50));

    fs.copyFileSync(backupPath, dbPath);
  } finally {
    openDB(dbUrl);
  }
  app.relaunch();
  app.exit();
}
