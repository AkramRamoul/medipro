// validateLicense.ts
import crypto from "crypto";
import base32Decode from "base32-decode";

// Shared HMAC secret — must match the generator. Read once at module-init and freeze.
const _SECRET: string = process.env.LICENSE_SECRET ?? "";
Object.freeze(_SECRET);

/**
 * Validates a license key against the HMAC-SHA256 shared secret.
 *
 * Security notes:
 *  - Error details are never logged (prevents key-format enumeration).
 *  - timingSafeEqual is used for constant-time comparison to prevent timing attacks.
 */
export function validateLicenseKey(
    licenseKey: string,
    payload: { expiry: string; machineId: string },
): boolean {
    try {
        if (!_SECRET) return false;

        const cleanedKey = licenseKey.replace(/-/g, "").toUpperCase();
        const keyDigest = Buffer.from(base32Decode(cleanedKey, "RFC4648"));

        // Deterministic JSON payload string (key order matters)
        const payloadStr = JSON.stringify({
            expiry: payload.expiry,
            machineId: payload.machineId,
        });

        const expectedHmac = crypto.createHmac("sha256", _SECRET);
        expectedHmac.update(payloadStr);
        const expectedDigest = expectedHmac.digest().slice(0, 10);

        // Lengths must match before timingSafeEqual
        if (keyDigest.length !== expectedDigest.length) return false;

        return crypto.timingSafeEqual(keyDigest, expectedDigest);
    } catch {
        // Do NOT expose error details – they can leak the expected key format.
        return false;
    }
}
