import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

// 🏥 Patients Table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // Male, Female, Other
  contact: text("contact").notNull().unique(),
  address: text("address"),
  weight: integer("weight"),
  bloodType: text("blood_type"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 📝 Consultations Table (Linked to Patients)
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // Foreign key to Patients
  date: timestamp("date").defaultNow(),
  reason: text("reason").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
});

// 💊 Prescriptions Table (Linked to Patients, No Link to Consultations)
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // Foreign key to Patients
  medicineName: text("medicine_name").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions"),
  date: timestamp("date").defaultNow(),
});
