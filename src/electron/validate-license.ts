// validateLicense.ts
import crypto from "crypto";
import base32Decode from "base32-decode";
import { getpub } from "./util.js"; // your function that reads public.pem

const publicKey = getpub();

export function validateLicenseKey(
    licenseKey: string,
    payload: { expiry: string; machineId: string },
): boolean {
    try {
        const cleanedKey = licenseKey.replace(/-/g, "").toUpperCase();
        const signature = Buffer.from(base32Decode(cleanedKey, "RFC4648"));

        const payloadStr = JSON.stringify(payload);
        const hash = crypto.createHash("sha256").update(payloadStr).digest();

        const isValid = crypto.verify("sha256", hash, publicKey, signature);
        return isValid;
    } catch (err) {
        console.error("Validation failed:", err);
        return false;
    }
}
