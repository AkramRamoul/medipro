// drizzle/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
