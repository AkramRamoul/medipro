import fs from "fs";
import { closeDB, openDB } from "./db.js";
import { dbPath, dbUrl } from "./database-path.js";

/**
 * @param backupPath
 */
export async function backupDatabase(backupPath: string) {
  await closeDB();
  try {
    fs.copyFileSync(dbPath, backupPath);
  } finally {
    openDB(dbUrl);
  }
}
