import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import path from "path";

async function main() {
  const dbPath = path.resolve("database.db");
  const migrationsFolder = path.resolve("src/db/migrations");

  console.log(`🚀 Starting migration...`);
  console.log(`📁 Database: ${dbPath}`);
  console.log(`📁 Migrations: ${migrationsFolder}`);

  const client = createClient({
    url: `file:${dbPath}`,
  });

  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder });
    console.log("✅ Migrations applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
