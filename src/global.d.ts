export interface DashboardStats {
  consultationsThisMonth: number;
  consultationsLastMonth: number;
  consultationsToday: number;
  prescriptionsThisMonth: number;
  totalPatients: number;
  appointmentsToday: number;
  patientsThisMonth: number;
  patientsLastMonth: number;
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
  earningsThisMonth: number;
  earningsToday: number;
  earningsLastMonth: number;
  expensesThisMonth: number;
  expensesToday: number;
  expensesLastMonth: number;
}

export interface VitalSignsData {
  date: string | null;
  bloodPressure?: string | null;
  glucose?: string | null;
  weight?: string | null;
}

export interface IElectronAPI {
  addPatient: (data: unknown) => Promise<void>;
  getallpatients(): Patient[];
  getpatient(id: string): Patient | null;
  getMedications: () => Promise<
    { name: string; form: string; dosage: string }[]
  >;
  getBilans: () => Promise<{ name: string }[]>;
  loadFonts: () => Promise<string>;
  addConsultation: (data: unknown) => Promise<void>;
  getConsultations(id: string): Consultation[];
  deleteCosultaion(id: string): Promise<void>;
  getConsultation(id: string): Consultation | null;
  getPatientPrescriptions(id: string): Prescription[];
  addFullPrescription: (data: unknown) => Promise<{
    success: boolean;
    message: string;
    psychotropic_number?: number;
  }>;
  deletePrescription: (id: string) => Promise<void>;
  editConsultation: (data: unknown) => Promise<void>;
  editPatient: (data: unknown) => Promise<{ success: boolean }>;
  deletePatient: (id: string) => Promise<{ success: boolean; error?: string }>;
  uploadImage: (filePath: string) => {
    success: boolean;
    path: string;
    error?: string;
  };
  savePrescriptionModel: (
    data: unknown,
  ) => Promise<{ success: boolean; error?: string; model: PrescriptionModel }>;
  getPrescriptionModel: () => Promise<{
    success: boolean;
    model: PrescriptionModel;
    error?: string;
  }>;
  getImage: () => Promise<{ success: boolean; image: string; error?: string }>;
  getDashboardStats: () => Promise<DashboardStats>; // ✅ FIX HERE
  printPdf: (data: Buffer) => Promise<void>;
  savePdf: (
    buffer: ArrayBuffer,
    filename: string,
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  printHtml: (htmlContent: string) => Promise<{ success: boolean; error?: string }>;
  generatePdf: (
    htmlContent: string,
    filename: string,
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  getAllPrescriptions: () => Promise<Prescription[]>;
  getAllConsultations: () => Promise<Consultation[]>;
  getMonthlyPatients: () => Promise<{
    success: boolean;
    data: { name: string; total: number }[];
  }>;
  createPassword: (password: string) => Promise<void>;
  checkPassword: (password: string) => Promise<{ match: boolean }>;
  checkPasswordExists: () => Promise<{ exists: boolean }>;
  removePassword: (
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean }>;
  createName: (nameFr: string) => Promise<{ success: boolean }>;
  getName: () => Promise<{ success: boolean; name: string }>;
  getNextPsychotropicNumber: () => Promise<number>;
  createDocument: (data: unknown) => Promise<{ success: boolean; id?: number; error?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPatientDocuments: (id: string) => Promise<any[]>;
  deleteDocument: (id: string) => Promise<void>;
  backup: () => Promise<void>;
  restore: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPatientTimeline: (id: string) => Promise<any[]>;
  addAppointment: (data: unknown) => Promise<{ success: boolean; error?: string }>;
  getAppointments: (patientId: string) => Promise<Appointment[]>;
  getAllAppointments: () => Promise<(Appointment & { patientFirstName: string; patientLastName: string })[]>;
  deleteAppointment: (id: number) => Promise<{ success: boolean; error?: string }>;

  getStoredLicense: () => Promise<LicensePayload | undefined>;
  submitLicense: (key: string, payload: LicensePayload) => Promise<boolean>;
  getMachineId: () => string;
  getAppInitData: () => Promise<{
    isLicensed: boolean;
    passwordExists: boolean;
    machineId: string;
  }>;
  resetLicense: () => void;
  getCustomFields: () => Promise<any[]>;
  addCustomField: (data: any) => Promise<{ success: boolean; error?: string }>;
  deleteCustomField: (id: number) => Promise<{ success: boolean; error?: string }>;
  getPrescriptionTemplates: () => Promise<any[]>;
  addPrescriptionTemplate: (data: any) => Promise<{ success: boolean; error?: string }>;
  deletePrescriptionTemplate: (id: number) => Promise<{ success: boolean; error?: string }>;
  getDocumentTemplates: () => Promise<any[]>;
  addDocumentTemplate: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateDocumentTemplate: (data: any) => Promise<{ success: boolean; error?: string }>;
  deleteDocumentTemplate: (id: number) => Promise<{ success: boolean; error?: string }>;
  getPatientVitals: (patientId: number) => Promise<VitalSignsData[]>;
  getExpenses: () => Promise<Expense[]>;
  addExpense: (data: any) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: number) => Promise<{ success: boolean; error?: string }>;
  searchICD10: (query: string) => Promise<ICD10[]>;
  importICD10: (data: any[]) => Promise<{ success: boolean; error?: string }>;
  globalSearch: (query: string) => Promise<any[]>;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface ICD10 {
  code: string;
  label: string;
  category?: string;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
