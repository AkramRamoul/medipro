import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";
import url from "url";

const dbPath = path.resolve(process.env.DATABASE_PATH || "database.db");
const dbUrl = url.pathToFileURL(dbPath).toString();

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./backend/src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
  },
});
