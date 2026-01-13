import fs from "fs";
import { closeDB, openDB } from "./db.js";
import { dbPath, dbUrl } from "./database-path.js";
import { app } from "electron";

/**
 * @param backupPath absolute path chosen by the user
 */
export async function restoreDatabase(backupPath: string) {
  // 1️⃣ close DB (release lock)
  await closeDB();

  try {
    // small delay for Windows file lock
    await new Promise((r) => setTimeout(r, 50));

    // 2️⃣ replace database file
    fs.copyFileSync(backupPath, dbPath);
  } finally {
    // 3️⃣ reopen DB
    openDB(dbUrl);
  }

  // 4️⃣ restart app to avoid stale state
  app.relaunch();
  app.exit();
}
