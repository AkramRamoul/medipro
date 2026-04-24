import { db } from "./backend/src/db/index.js";
import { users } from "./backend/src/db/schema.js";
import { env } from "./backend/src/config/env.js";

async function main() {
  env.DATABASE_PATH = "../database.db"; // force correct relative path
  process.chdir("D:/Doc/backend");
  
  const allUsers = await db.select().from(users);
  console.log("USERS IN DB:", allUsers);
  process.exit(0);
}

main();
