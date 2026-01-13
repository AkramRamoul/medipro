import fs from "fs";
import { closeDB, openDB } from "./db.js";
import { dbPath, dbUrl } from "./database-path.js";

/**
 * @param backupPath absolute path chosen by the user
 */
export async function backupDatabase(backupPath: string) {
  // 1️⃣ close DB (release file lock)
  await closeDB();

  try {
    // 2️⃣ copy database file
    fs.copyFileSync(dbPath, backupPath);
  } finally {
    // 3️⃣ ALWAYS reopen DB (even if copy fails)
    openDB(dbUrl);
  }
}
