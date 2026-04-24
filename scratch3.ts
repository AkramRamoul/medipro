import { reinitializeDb } from "./backend/src/db/index.js";
import { env } from "./backend/src/config/env.js";

async function main() {
  env.DATABASE_PATH = "../database.db"; // force correct relative path
  process.chdir("D:/Doc/backend");
  await reinitializeDb();
  console.log("Seeding complete.");
}

main();
