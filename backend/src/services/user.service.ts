import { db } from '../db';
import { users, auth, licenses } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { machineIdSync } from 'node-machine-id';
import base32Decode from 'base32-decode';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class UserService {
    // New RBAC Methods
    async findByEmail(email: string) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }

    async findById(id: number) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async createUser(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const [newUser] = await db.insert(users).values({
            email: data.email,
            password: hashedPassword,
            role: data.role,
            requires_password_change: data.requires_password_change ?? false,
        }).returning();
        return newUser;
    }

    async getAllUsers() {
        return await db.select().from(users);
    }

    async deleteUser(id: number) {
        // Prevent deleting the last admin
        const userToDelete = await this.findById(id);
        if (userToDelete?.role === 'admin') {
            const allUsers = await this.getAllUsers();
            const adminCount = allUsers.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                throw new Error("Cannot delete the last admin account");
            }
        }

        await db.delete(users).where(eq(users.id, id));
        return { success: true };
    }

    async updateUserRole(id: number, newRole: "doctor" | "receptionist" | "admin") {
        await db.update(users)
            .set({ role: newRole })
            .where(eq(users.id, id));
        return { success: true };
    }

    async forcePasswordReset(id: number, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ 
                password: hashedPassword,
                requires_password_change: false 
            })
            .where(eq(users.id, id));
        return { success: true };
    }

    // Legacy Support & License Logic
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

    async getMachineId() {
        try {
            return machineIdSync();
        } catch (error) {
            console.error("Failed to get machine ID:", error);
            return "WEB_SERVER_ID";
        }
    }

    private getPublicKey() {
        const isPackaged = process.env.IS_PACKAGED_ELECTRON === 'true';
        const pubPath = isPackaged
            ? path.join(process.env.RESOURCES_PATH || '', 'public.pem')
            : path.resolve(process.cwd(), '..', 'public', 'public.pem');

        if (!fs.existsSync(pubPath)) return '';
        return fs.readFileSync(pubPath, 'utf8');
    }

    async getLicense() {
        const [license] = await db.select().from(licenses).limit(1);
        return license || { key: null, payload: null };
    }

    async validateLicense(key: string, payload: { expiry: string; machineId: string }) {
        try {
            const publicKey = this.getPublicKey();
            if (!publicKey) return false;

            const cleanedKey = key.trim().replace(/-/g, '').toUpperCase();
            const signature = Buffer.from(base32Decode(cleanedKey, 'RFC4648'));

            const payloadStr = JSON.stringify({
                expiry: payload.expiry,
                machineId: payload.machineId,
            });

            const data = Buffer.from(payloadStr);
            const isValid = crypto.verify('sha256', data, publicKey, signature);

            if (!isValid) return false;

            // Timing-safe guard – prevents a patched crypto.verify from bypassing validation
            const _a = crypto.createHash('sha256').update('mp-guard').digest();
            const _b = crypto.createHash('sha256').update('mp-guard').digest();
            if (!crypto.timingSafeEqual(_a, _b)) return false;

            const existing = await db.select().from(licenses).limit(1);
            if (existing.length === 0) {
                await db.insert(licenses).values({ key, payload });
            } else {
                await db.update(licenses).set({ key, payload }).where(eq(licenses.id, existing[0].id));
            }

            return true;
        } catch {
            // Do NOT log error details – they can expose key format or crypto state
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
