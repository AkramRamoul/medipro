import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, real } from "drizzle-orm/sqlite-core";

export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender").notNull(),
  contact: text("contact"),
  address: text("address"),
  weight: integer("weight"),
  bloodType: text("blood_type"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  tags: text("tags"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  nameIdx: index("patient_name_idx").on(table.first_name, table.last_name),
}));

export const consultations = sqliteTable("consultations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  reason: text("reason").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  symptoms: text("symptoms"),
  bloodPressure: text("blood_pressure"),
  glucose: text("glucose"),
  weight: text("weight"),
  amountPaid: integer("amount_paid"),
  customFields: text("custom_fields", { mode: "json" })
    .$type<Record<string, any>>()
    .default(sql`'{}'`),
  appointmentId: integer("appointment_id")
    .references(() => appointments.id, { onDelete: "set null" }),
  formId: integer("form_id"),
  formData: text("form_data", { mode: "json" })
    .$type<Record<string, any>>()
    .default(sql`'{}'`),
  status: text("status").notNull().default("in_progress"),
}, (table) => ({
  patientIdIdx: index("consultation_patient_id_idx").on(table.patientId),
  dateIdx: index("consultation_date_idx").on(table.date),
}));

export const customFields = sqliteTable("custom_fields", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  label: text("label").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  prescriptionDate: text("prescription_date").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  is_psychotropic: integer("is_psychotropic", { mode: "boolean" }).default(false),
  psychotropic_number: integer("psychotropic_number"),
  patient_address: text("patient_address"),
}, (table) => ({
  patientIdIdx: index("prescription_patient_id_idx").on(table.patientId),
  dateIdx: index("prescription_date_idx").on(table.prescriptionDate),
}));

export const prescriptionMedications = sqliteTable("prescription_medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prescriptionId: integer("prescription_id")
    .notNull()
    .references(() => prescriptions.id, { onDelete: "cascade" }),
  medicineName: text("medicine_name").notNull(),
  dosage: text("dosage").notNull(),
  duration: text("duration"),
  quantity: text("quantity"),
  form: text("form"),
  note: text("note"),
});

export const image = sqliteTable("image", {
  image_path: text("image_path").notNull(),
});

export const prescriptionModel = sqliteTable("prescription_model", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  specialtyFr: text("specialty_fr").notNull(),
  specialtyAr: text("specialty_ar").notNull(),
  inscriptionNumber: text("inscription_number", { length: 255 }).notNull(),
  servicesFr: text("services_fr").notNull(),
  servicesAr: text("services_ar").notNull(),
  address: text("address").notNull(),
  phoneNumber1: text("phone_number_1"),
  phoneNumber2: text("phone_number_2"),
  city: text("city").notNull(),
  accentColor: text("accent_color"),
  fontFamily: text("font_family"),
  doctorNameFontSize: integer("doctor_name_font_size").default(14),
  specialtyFontSize: integer("specialty_font_size").default(10),
  titleFontSize: integer("title_font_size").default(18),
  bodyFontSize: integer("body_font_size").default(12),
  logoSize: integer("logo_size").default(60),
  watermarkOpacity: integer("watermark_opacity").default(10),
  dividerStyle: text("divider_style").default("solid"),
  titleText: text("title_text").default("ORDONNANCE"),
  showInscriptionNumber: integer("show_inscription_number", { mode: "boolean" }).default(true),
  layoutTemplate: text("layout_template").default("standard"),
  languageMode: text("language_mode").default("bilingual"),
  useCustomLayout: integer("use_custom_layout", { mode: "boolean" }).default(false),
  customPositions: text("custom_positions", { mode: "json" }).$type<any>(),
  hiddenElements: text("hidden_elements", { mode: "json" }).$type<string[]>(),
});

export const psychotropicCounters = sqliteTable("psychotropic_counters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const bilanTemplates = sqliteTable("bilan_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const bilanTemplateItems = sqliteTable("bilan_template_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  templateId: integer("template_id")
    .notNull()
    .references(() => bilanTemplates.id, { onDelete: "cascade" }),
  analysisName: text("analysis_name").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["doctor", "receptionist", "admin"] }).notNull(),
  requires_password_change: integer("requires_password_change", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const auth = sqliteTable("auth", {
  id: integer("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
});

export const Name = sqliteTable("name", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameFr: text("name").notNull(),
});

const docTypeEnums = ["blood", "certificate", "report", "template"] as const;

export const Document = sqliteTable("document", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  name: text("name"),
  type: text("type", { enum: docTypeEnums }).notNull(),
  content: text("content", { mode: "json" })
    .$type<any>()
    .default(sql`'[]'`),
  documentDate: text("document_date").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  patientIdIdx: index("document_patient_id_idx").on(table.patientId),
  dateIdx: index("document_date_idx").on(table.documentDate),
}));

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  time: text("time"),
  title: text("title").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"),
}, (table) => ({
  patientIdIdx: index("appointment_patient_id_idx").on(table.patientId),
  dateIdx: index("appointment_date_idx").on(table.date),
}));

export const prescriptionTemplates = sqliteTable("prescription_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const prescriptionTemplateMedications = sqliteTable(
  "prescription_template_medications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    templateId: integer("template_id")
      .notNull()
      .references(() => prescriptionTemplates.id, { onDelete: "cascade" }),
    medicineName: text("medicine_name").notNull(),
    dosage: text("dosage").notNull(),
    duration: text("duration"),
    quantity: text("quantity"),
    form: text("form"),
    note: text("note"),
  },
);

export const documentTemplates = sqliteTable("document_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["work_stop", "medical_certificate", "chronic_disease", "referral", "exam_request", "custom"],
  }).notNull(),
  content: text("content").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  dateIdx: index("expense_date_idx").on(table.date),
}));

export const labResults = sqliteTable("lab_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  panelId: text("panel_id").notNull(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  panelName: text("panel_name").notNull(),
  testName: text("test_name").notNull(),
  value: real("value").notNull(),
  unit: text("unit"),
  referenceMin: real("reference_min"),
  referenceMax: real("reference_max"),
  status: text("status").notNull().default("normal"),
  notes: text("notes"),
  measuredAt: text("measured_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  patientDateIdx: index("lab_results_patient_date_idx").on(table.patientId, table.measuredAt),
  panelIdx: index("lab_results_panel_idx").on(table.panelId),
}));

export const examForms = sqliteTable("exam_forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  specialty: text("specialty").notNull().default("general"),
  fields: text("fields", { mode: "json" })
    .$type<any[]>()
    .default(sql`'[]'`),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const licenses = sqliteTable("licenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull(),
  payload: text("payload", { mode: "json" }).$type<any>().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type PrescriptionMed = typeof prescriptionMedications.$inferSelect;
export type NewPrescriptionMed = typeof prescriptionMedications.$inferInsert;
export type prescriptionModel = typeof prescriptionModel.$inferSelect;
export type document = typeof Document.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type LabResult = typeof labResults.$inferSelect;
export type ExamForm = typeof examForms.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type User = typeof users.$inferSelect;
