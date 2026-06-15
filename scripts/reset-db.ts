import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  const filesToDelete = [
    path.resolve("database.db"),
    path.resolve("database.db-wal"),
    path.resolve("database.db-shm"),
  ];

  console.log("🗑️  Removing existing database files...");
  for (const file of filesToDelete) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`✅ Deleted: ${path.basename(file)}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete ${path.basename(file)}: ${error.message}`);
        console.log("The database file might be locked by a running process (like the dev server).");
        console.log("Please stop the application or backend server before running this reset script.");
        process.exit(1);
      }
    }
  }

  console.log("\n🚀 Recreating database schema via Drizzle push...");
  try {
    execSync("npx drizzle-kit push", { stdio: "inherit" });
    console.log("\n✨ Database has been successfully reset to a completely fresh, empty state!");
    console.log("🌱 Starting the backend server will automatically seed the initial admin account and default templates.");
  } catch (error: any) {
    console.error("\n❌ Failed to recreate database schema:", error.message);
    process.exit(1);
  }
}

main();
