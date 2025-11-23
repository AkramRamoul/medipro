import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 🏥 Patients Table
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  contact: text("contact"),
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
  is_psychotropic: integer("is_psychotropic", { mode: "boolean" }).default(
    false
  ),
  psychotropic_number: integer("psychotropic_number"), // use integer for sorting/searching
  patient_address: text("patient_address"), // snapshot of address at time of prescription
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
  address: text("address").notNull(),
  phoneNumber1: text("phone_number_1"),
  phoneNumber2: text("phone_number_2"),
  city: text("city").notNull(),
});
export const psychotropicCounters = sqliteTable("psychotropic_counters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const auth = sqliteTable("auth", {
  id: integer("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
});

export const Name = sqliteTable("name", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameFr: text("name").notNull(),
});

const docTypeEnums = ["blood", "certificate", "report"] as const;

export const Document = sqliteTable("document", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  type: text("type", { enum: docTypeEnums }).notNull(),
  content: text("content", { mode: "json" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .$type<any>()
    .default(sql`'[]'`),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type PrescriptionMed = typeof prescriptionMedications.$inferSelect;
export type NewPrescriptionMed = typeof prescriptionMedications.$inferInsert;
export type prescriptionModel = typeof prescriptionModel.$inferSelect;
export type document = typeof Document.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
