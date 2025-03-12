import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations", // ✅ Migration folder
  schema: "./src/electron/schema.ts", // ✅ Schema file path
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!, // ✅ Correct DB path
  },
});
