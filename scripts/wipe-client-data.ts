import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
    patients,
    consultations,
    prescriptions,
    appointments,
    Document,
    expenses,
    psychotropicCounters,
    prescriptionMedications,
    labResults,
    licenses,
    prescriptionModel,
} from "../backend/src/db/schema";
import path from "path";
import fs from "fs";

async function main() {
    const dbPath = path.resolve("database.db");

    if (!fs.existsSync(dbPath)) {
        console.error(`Database file not found at ${dbPath}`);
        process.exit(1);
    }

    const client = createClient({
        url: `file:${dbPath}`,
    });

    const db = drizzle(client);

    console.log("🧹 Wiping client database rows...");

    try {
        // Delete in reverse order of dependency if applicable
        await db.delete(expenses);
        console.log("✅ Expenses cleared");

        await db.delete(appointments);
        console.log("✅ Appointments cleared");

        // Documents linked to patients
        await db.delete(Document);
        console.log("✅ Documents cleared");

        await db.delete(prescriptionMedications);
        console.log("✅ Prescription medications cleared");

        await db.delete(prescriptions);
        console.log("✅ Prescriptions cleared");

        await db.delete(consultations);
        console.log("✅ Consultations cleared");

        await db.delete(labResults);
        console.log("✅ Lab results cleared");

        await db.delete(patients);
        console.log("✅ Patients cleared");

        await db.delete(psychotropicCounters);
        console.log("✅ Psychotropic counters cleared");

        // Client specific setup
        await db.delete(licenses);
        console.log("✅ Licenses cleared");

        await db.delete(prescriptionModel);
        console.log("✅ Prescription models cleared");

        console.log("✨ Database successfully prepped for fresh client install!");
        console.log("ℹ️ Administrator accounts and built-in templates have been preserved.");
    } catch (error) {
        console.error("❌ Failed to wipe client database:", error);
    } finally {
        client.close();
    }
}

main();
