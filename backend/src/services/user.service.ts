import { db } from '../db';
import { auth, licenses } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { machineIdSync } from 'node-machine-id';
import base32Decode from 'base32-decode';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class UserService {
    async checkPasswordExists() {
        const result = await db.select().from(auth).limit(1);
        return result.length > 0 && !!result[0].passwordHash;
    }

    async checkPassword(password: string) {
        const result = await db.select().from(auth).limit(1);
        const storedHash = result[0]?.passwordHash;

        if (!storedHash) return false;

        return await bcrypt.compare(password, storedHash);
    }

    async createPassword(password: string) {
        const existing = await db.select().from(auth).limit(1);
        if (existing.length > 0) {
            throw new Error("Password already set");
        }
        const hashed = await bcrypt.hash(password, 10);
        await db.insert(auth).values({ passwordHash: hashed });
        return { success: true };
    }

    async changePassword(oldPassword: string, newPassword: string) {
        const result = await db.select().from(auth).limit(1);
        const storedHash = result[0]?.passwordHash;

        if (!storedHash) throw new Error("No password set");

        const isCorrect = await bcrypt.compare(oldPassword, storedHash);
        if (!isCorrect) return { success: false, message: "Incorrect old password" };

        const newHashed = await bcrypt.hash(newPassword, 10);
        await db.update(auth).set({ passwordHash: newHashed }).where(eq(auth.id, result[0].id));
        return { success: true };
    }

    async removePassword(password: string) {
        const result = await db.select().from(auth).limit(1);
        const storedHash = result[0]?.passwordHash;

        if (!storedHash) return { success: false, message: "No password set" };

        const isCorrect = await bcrypt.compare(password, storedHash);
        if (!isCorrect) return { success: false, message: "Incorrect password" };

        await db.delete(auth).where(eq(auth.id, result[0].id));
        return { success: true };
    }

    // License implementation
    async getMachineId() {
        try {
            return machineIdSync();
        } catch (error) {
            console.error("Failed to get machine ID:", error);
            return "WEB_SERVER_ID"; // Fallback
        }
    }

    private getPublicKey() {
        const pubPath = path.resolve(process.cwd(), '..', 'public', 'public.pem');
        if (!fs.existsSync(pubPath)) {
            throw new Error(`Public key not found at ${pubPath}`);
        }
        return fs.readFileSync(pubPath, 'utf8');
    }

    async getLicense() {
        const [license] = await db.select().from(licenses).limit(1);
        return license || { key: null, payload: null };
    }

    async validateLicense(key: string, payload: { expiry: string; machineId: string }) {
        try {
            const publicKey = this.getPublicKey();
            const cleanedKey = key.replace(/-/g, "").toUpperCase();
            const signature = Buffer.from(base32Decode(cleanedKey, "RFC4648"));

            const payloadStr = JSON.stringify({
                expiry: payload.expiry,
                machineId: payload.machineId
            });

            const data = Buffer.from(payloadStr);
            const isValid = crypto.verify("sha256", data, publicKey, signature);

            if (isValid) {
                // Save valid license to DB
                const existing = await db.select().from(licenses).limit(1);
                if (existing.length === 0) {
                    await db.insert(licenses).values({ key, payload });
                } else {
                    await db.update(licenses).set({ key, payload }).where(eq(licenses.id, existing[0].id));
                }
            }

            return isValid;
        } catch (err) {
            console.error("Validation failed:", err);
            return false;
        }
    }

    async getAppInitData() {
        const passwordExists = await this.checkPasswordExists();
        const license = await this.getLicense();
        const machineId = await this.getMachineId();

        let isLicensed = false;
        if (license.key && license.payload) {
            isLicensed = await this.validateLicense(license.key, license.payload);
        }

        return {
            isLicensed,
            passwordExists,
            machineId,
        };
    }
}

export const userService = new UserService();
