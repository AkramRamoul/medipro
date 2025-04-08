import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 🏥 Patients Table
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // Male, Female, Other
  contact: text("contact").notNull().unique(),
  address: text("address"),
  weight: integer("weight"),
  bloodType: text("blood_type"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 📝 Consultations Table (Linked to Patients)
export const consultations = sqliteTable("consultations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // Foreign key to Patients
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  reason: text("reason").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  symptoms: text("symptoms"),
});

export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
});

// New table for storing multiple medications per prescription
export const prescriptionMedications = sqliteTable("prescription_medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prescriptionId: integer("prescription_id")
    .notNull()
    .references(() => prescriptions.id, { onDelete: "cascade" }), // Links to a prescription
  medicineName: text("medicine_name").notNull(),
  dosage: text("dosage").notNull(),
  duration: text("duration"),
  quantity: text("quantity"),
  form: text("form"),
  note: text("note"),
});

export const image = sqliteTable("image", {
  imagePath: text("image_path"), // store file path here
});

export const prescriptionModel = sqliteTable("prescription_model", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  specialtyFr: text("specialty_fr").notNull(),
  specialtyAr: text("specialty_ar").notNull(),
  inscriptionNumber: text("inscription_number", { length: 255 }).notNull(),
  servicesFr: text("services_fr").notNull(), // store as JSON string
  servicesAr: text("services_ar").notNull(),
});

export type PrescriptionMed = typeof prescriptionMedications.$inferSelect;
export type NewPrescriptionMed = typeof prescriptionMedications.$inferInsert;

export type prescriptionModel = typeof prescriptionModel.$inferSelect;

export type Prescription = typeof prescriptions.$inferSelect;
