import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

// Define Patient Table
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
