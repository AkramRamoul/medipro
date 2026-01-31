import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import path from "path";
import { app } from "electron";
import fs from "fs";
import { pathToFileURL } from "url";

import { dbUrl } from "./database-path.js";

export const db = drizzle(
  createClient({
    url: dbUrl,
    syncUrl: undefined,
  }),
);
