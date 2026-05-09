#!/usr/bin/env node
/**
 * scripts/obfuscate-electron.mjs
 *
 * Obfuscates the compiled Electron main-process JavaScript files.
 * Targets only the security-sensitive files (license, auth, main entry)
 * to avoid breaking Electron's internal module loading.
 *
 * Skipped automatically when NODE_ENV=development.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist-electron');

// Skip in development mode
if (process.env.NODE_ENV === 'development') {
    console.log('[obfuscate-electron] Skipped (development mode)');
    process.exit(0);
}

/**
 * These are the files that contain sensitive logic (license validation,
 * password handling, JWT secret derivation). We obfuscate only these
 * to avoid destabilising Electron's module resolution for everything else.
 */
const SENSITIVE_FILES = [
    'validate-license.js',
    'LicenseStore.js',
    'main.js',
    'preload.cjs',
    'util.js',
    'schema.js',
    'db.js',
];

const OBFUSCATOR_OPTIONS = {
    compact: false,                     // Set to false for better error reporting during debugging
    controlFlowFlattening: false,       // Keep fast startup
    deadCodeInjection: false,           // Avoid size bloat
    stringArray: true,                  // Encode string literals
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.85,
    rotateStringArray: true,
    shuffleStringArray: true,
    unicodeEscapeSequence: false,       // Stay compatible with Node's parser
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,               // Must stay false – Electron globals must be accessible
    selfDefending: false,               // Strict CSP / eval blocks self-defending code
    debugProtection: false,
    disableConsoleOutput: false,        // Keep console for error logs
    sourceMap: false,
    target: 'node',                     // Use node target for Electron main process
};

let count = 0;

for (const filename of SENSITIVE_FILES) {
    const filePath = join(distDir, filename);
    if (!existsSync(filePath)) {
        console.warn(`[obfuscate-electron] Not found, skipping: ${filename}`);
        continue;
    }

    const source = readFileSync(filePath, 'utf8');
    try {
        const result = JavaScriptObfuscator.obfuscate(source, OBFUSCATOR_OPTIONS);
        writeFileSync(filePath, result.getObfuscatedCode(), 'utf8');
        console.log(`[obfuscate-electron] Obfuscated: ${filename}`);
        count++;
    } catch (err) {
        console.error(`[obfuscate-electron] Failed on ${filename}:`, err.message);
        process.exit(1);
    }
}

console.log(`[obfuscate-electron] Done. ${count} file(s) obfuscated.`);
