import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";
import url from "url";

// Correct SQLite file path format
const dbPath = path.resolve("D:/Doc/database.db");
const dbUrl = url.pathToFileURL(dbPath).toString(); // ✅ Convert to valid `file://` URL

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/electron/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl, // ✅ Corrected URL format
  },
});
