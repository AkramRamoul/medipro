import { drizzle } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";

let client: Client | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

export function openDB(dbUrl: string) {
  if (client) return db;

  client = createClient({
    url: dbUrl,
    syncUrl: undefined,
  });

  db = drizzle(client);
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDB() {
  if (!db) {
    throw new Error("DB not initialized. Call openDB() first.");
  }
  return db;
}
