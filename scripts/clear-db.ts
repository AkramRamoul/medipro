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
  users,
  auth,
} from "../src/electron/schema";
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

  console.log("🗑️  Clearing database rows...");

  try {
    // Delete in order to respect any FKs if cascades aren't fully trusted,
    // but with cascade on delete in schema, deleting patients might be enough for most.
    // However, cleaning child tables first is safer or cleaning independent ones.

    await db.delete(expenses);
    console.log("✅ Expenses cleared");

    await db.delete(appointments);
    console.log("✅ Appointments cleared");

    // Documents linked to patients
    await db.delete(Document);
    console.log("✅ Documents cleared");

    // Prescriptions allow null patient? No, not null.
    await db.delete(prescriptions);
    console.log("✅ Prescriptions cleared");

    await db.delete(consultations);
    console.log("✅ Consultations cleared");

    await db.delete(patients);
    console.log("✅ Patients cleared");

    await db.delete(psychotropicCounters);
    console.log("✅ Psychotropic counters cleared");

    await db.delete(users);
    console.log("✅ User accounts cleared");

    await db.delete(auth);
    console.log("✅ Auth records cleared");

    // NEW: Clear templates and other settings
    const { documentTemplates, prescriptionTemplates, prescriptionTemplateMedications, labResults, examForms } = await import("../src/electron/schema");
    await db.delete(documentTemplates);
    console.log("✅ Document templates cleared");
    
    await db.delete(prescriptionTemplateMedications);
    await db.delete(prescriptionTemplates);
    console.log("✅ Prescription templates cleared");

    await db.delete(labResults);
    console.log("✅ Lab results cleared");

    await db.delete(examForms);
    console.log("✅ Exam forms cleared");

    console.log("✨ Database successfully emptied!");
  } catch (error) {
    console.error("❌ Failed to clear database:", error);
  } finally {
    client.close();
  }
}

main();
