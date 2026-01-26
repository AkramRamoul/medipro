import path from "path";
import fs from "fs";

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}


export function getpub() {
  const pubPath = isDevelopment()
    ? "public/public.pem"
    : path.join(process.resourcesPath, "public.pem"); // ✅ Correct path
  return fs.readFileSync(pubPath, "utf8");
}