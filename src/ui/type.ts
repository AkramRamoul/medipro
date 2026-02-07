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
  tags?: string;
  notes?: string;
  createdAt: string; // "YYYY-MM-DD"
};

export type Consultation = {
  id: string;
  patientId: string;
  reason: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  customFields?: Record<string, any>;
  amountPaid?: number;
  date: string;
};

export type DashboardStats = {
  consultationsThisMonth: number;
  consultationsToday: number;
  prescriptionsThisMonth: number;
  consultationsLastMonth: number;
  patientsThisMonth: number;
  patientsLastMonth: number;

  totalPatients: number;
  appointmentsToday: number;
  earningsThisMonth: number;
  earningsToday: number;
  earningsLastMonth: number;
  expensesThisMonth: number;
  expensesToday: number;
  expensesLastMonth: number;
  recentConsultations: {
    id: number;
    firstName: string;
    lastName: string;
    reason: string;
    diagnosis: string;
    date: string;
  }[];
  commonDiagnoses: { diagnosis: string; count: number }[];
  busiestDays: { day: string; count: number }[];
  retentionRate: number;
  totalReturnPatients: number;
  totalUniquePatients: number;
};

export type VitalSignsData = {
  date: string | null;
  bloodPressure?: string | null;
  glucose?: string | null;
  weight?: string | null;
};

export interface Prescription {
  id: number;
  isPsychotropic?: boolean;
  psychotropicNumber?: number;
  patientAddress?: string;
  date: string | null;
  patientId: number;
  medications: PrescriptionMed[];
}

export type PrescriptionWithPatient = {
  id: number;
  date: string;
  patientId: number;
  isPsychotropic?: boolean;
  psychotropicNumber?: number;
  patientAddress?: string;
  medications: PrescriptionMed[];
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
  } | null;
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
  customFields?: Record<string, any>;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
  } | null;
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
  name?: string;
  type: "blood" | "certificate" | "report" | "template";
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

export type Expense = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
};

export type ICD10 = {
  code: string;
  label: string;
  category?: string;
};

export interface SearchResult {
  type: "patient" | "consultation" | "action";
  id?: number;
  patientId?: number;
  title: string;
  subtitle: string;
  url?: string;
}
