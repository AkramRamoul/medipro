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

        // Ensure deterministic JSON payload string
        const payloadStr = JSON.stringify({
            expiry: payload.expiry,
            machineId: payload.machineId
        });

        console.log("Validating license for payload:", payloadStr);

        // Use the buffer directly with the algorithm specified
        const data = Buffer.from(payloadStr);
        const isValid = crypto.verify("sha256", data, publicKey, signature);

        console.log("License validation result:", isValid);
        return isValid;
    } catch (err) {
        console.error("Validation failed:", err);
        return false;
    }
}
