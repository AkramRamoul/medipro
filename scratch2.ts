import { reinitializeDb } from "./backend/src/db/index.js";

async function main() {
  await reinitializeDb();
  console.log("Seeding complete.");
}

main();
