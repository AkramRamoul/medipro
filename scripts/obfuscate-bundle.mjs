#!/usr/bin/env node
/**
 * scripts/obfuscate-bundle.mjs
 *
 * Obfuscates the backend Express server bundle (server-bundle.js) after
 * esbuild produces it. This hides the JWT secret derivation logic,
 * license validation code, password hashing calls, and database access.
 *
 * Run automatically as part of: npm run build:backend
 * Skipped when NODE_ENV=development.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bundlePath = join(__dirname, '..', 'backend', 'server-bundle.js');

if (process.env.NODE_ENV === 'development') {
    console.log('[obfuscate-bundle] Skipped (development mode)');
    process.exit(0);
}

if (!existsSync(bundlePath)) {
    console.error(`[obfuscate-bundle] Bundle not found at: ${bundlePath}`);
    process.exit(1);
}

const OBFUSCATOR_OPTIONS = {
    compact: true,
    controlFlowFlattening: false,       // Avoid startup latency on large bundles
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],    // Hides JWT secrets, SQL strings, etc.
    stringArrayThreshold: 0.85,
    rotateStringArray: true,
    shuffleStringArray: true,
    unicodeEscapeSequence: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,               // Global require/process/Buffer must stay intact
    selfDefending: false,               // eval is restricted in strict Node.js environments
    debugProtection: false,
    disableConsoleOutput: false,        // Keep server logs for production debugging
    sourceMap: false,
    target: 'node',
};

console.log(`[obfuscate-bundle] Reading: ${bundlePath}`);
const originalSize = readFileSync(bundlePath).length;
const source = readFileSync(bundlePath, 'utf8');

console.log('[obfuscate-bundle] Obfuscating...');
const startMs = Date.now();

let result;
try {
    result = JavaScriptObfuscator.obfuscate(source, OBFUSCATOR_OPTIONS);
} catch (err) {
    console.error('[obfuscate-bundle] Obfuscation failed:', err.message);
    process.exit(1);
}

const obfuscated = result.getObfuscatedCode();
writeFileSync(bundlePath, obfuscated, 'utf8');

const newSize = Buffer.byteLength(obfuscated, 'utf8');
const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
console.log(`[obfuscate-bundle] Done in ${elapsed}s. Size: ${(originalSize / 1e6).toFixed(1)} MB → ${(newSize / 1e6).toFixed(1)} MB`);
