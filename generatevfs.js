import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Handle __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust paths
const fontsDir = path.join(__dirname, "public/fonts");
const outputPath = path.join(__dirname, "src/custom_vfs_fonts.js");

const fonts = fs.readdirSync(fontsDir).filter((file) => file.endsWith(".ttf"));

const vfsResult = {};

for (const file of fonts) {
  const filePath = path.join(fontsDir, file);
  const fileData = fs.readFileSync(filePath).toString("base64");
  vfsResult[file] = fileData;
}

const output = `window.pdfMake = window.pdfMake || {}; window.pdfMake.vfs = ${JSON.stringify(
  vfsResult,
  null,
  2
)};`;

fs.writeFileSync(outputPath, output);

console.log("✅ Custom vfs_fonts.js generated!");
