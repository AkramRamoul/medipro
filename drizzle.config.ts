import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import "";
export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/electron/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
