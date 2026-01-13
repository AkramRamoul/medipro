import { PrescriptionMed } from "../electron/schema";

export type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  contact: string;
  address?: string;
  weight?: number;
  bloodType?: string;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  createdAt: string; // "YYYY-MM-DD"
};

export type Consultation = {
  id: string; // Unique identifier for the consultation
  patientId: string; // Foreign key to link to the patient
  reason: string; // Reason for the visit
  symptoms: string; // Description of symptoms
  diagnosis: string; // Doctor's diagnosis
  notes?: string; // Optional additional notes
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  date: string; // Timestamp for when the consultation was created
};

export type DashboardStats = {
  consultationsThisMonth: number;
  consultationsToday: number;
  prescriptionsThisMonth: number;
  consultationsLastMonth: number;

  activePatients: number;
  recentConsultations: {
    id: number;
    firstName: string;
    lastName: string;
    reason: string;
    diagnosis: string;
    date: string;
  }[];
};
export interface Prescription {
  id: number;
  isPsychotropic?: boolean;
  psychotropicNumber?: number;
  patientAddress?: string;
  date: string | null;
  patientId: number;
  medications: PrescriptionMed[]; // Add medications property
}

export type PrescriptionWithPatient = {
  id: number;
  date: string;
  patientId: number;
  isPsychotropic?: boolean;
  psychotropicNumber?: number;
  patientAddress?: string;
  medications: PrescriptionMed[]; // or Date, depending on how Drizzle returns it
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
  } | null; // because it's a left join, patient can be null
};
export type ConsultationWithPatient = {
  id: number;
  date: Date;
  reason: string;
  diagnosis: string;
  notes: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
  } | null; // because it's a left join, patient can be null
};

export type smallPatient = {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
};

export type monthlyPatients = {
  name: string;
  total: number;
};
export type Document = {
  id: number;
  patientId: number;
  type: "blood" | "certificate" | "report";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  createdAt: string | null;
};

export type BloodContent = {
  results: string[];
};

export type CertificateContent = {
  patientName: string;
  examinationDate: string;
  diagnosis: string;
  restStartDate: string;
  restEndDate: string;
  doctorName: string;
  remarks?: string;
};

export type ReportContent = {
  diagnosis: string;
  findings: string;
  conclusion?: string;
};

export type DocumentContent = BloodContent | CertificateContent | ReportContent;
