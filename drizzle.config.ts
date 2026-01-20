import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";
import url from "url";

const dbPath = path.resolve("D:/Doc/database.db");
const dbUrl = url.pathToFileURL(dbPath).toString(); //  file has to be to //:file format

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/electron/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
  },
});
