export interface DashboardStats {
  consultationsThisMonth: number;
  consultationsToday: number;
  prescriptionsThisMonth: number;
  activePatients: number;
  recentConsultations: {
    firstName: string;
    lastName: string;
    reason: string;
    diagnosis: string;
    date: string;
  }[];
}

export interface IElectronAPI {
  addPatient: (data: unknown) => Promise<void>;
  getallpatients(): Patient[];
  getpatient(id: string): Patient | null;
  getMedications: () => Promise<
    { name: string; form: string; dosage: string }[]
  >;
  loadFonts: () => Promise<string>;
  addConsultation: (data: unknown) => Promise<void>;
  getConsultations(id: string): Consultation[];
  deleteCosultaion(id: string): Promise<void>;
  getConsultation(id: string): Consultation | null;
  getPatientPrescriptions(id: string): Prescription[];
  addFullPrescription: (data: unknown) => Promise<{ success: boolean }>;
  deletePrescription: (id: string) => Promise<void>;
  editConsultation: (data: unknown) => Promise<void>;
  editPatient: (data: unknown) => Promise<{ success: boolean }>;
  uploadImage: (filePath: string) => {
    success: boolean;
    path: string;
    error?: string;
  };
  savePrescriptionModel: (
    data: unknown
  ) => Promise<{ success: boolean; error?: string }>;
  getPrescriptionModel: () => Promise<{
    success: boolean;
    model: PrescriptionModel;
    error?: string;
  }>;
  getImage: () => Promise<{ success: boolean; image: string; error?: string }>;
  getDashboardStats: () => Promise<DashboardStats>; // ✅ FIX HERE
  printPdf: (data: Buffer) => Promise<void>;
  getAllPrescriptions: () => Promise<Prescription[]>;
  getAllConsultations: () => Promise<Consultation[]>;
  getMonthlyPatients: () => Promise<{
    success: boolean;
    data: { name: string; total: number }[];
  }>;
  createPassword: (password: string) => Promise<void>;
  checkPassword: (password: string) => Promise<{ match: boolean }>;
  checkPasswordExists: () => Promise<{ exists: boolean }>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean }>;
  createName: (nameFr: string) => Promise<{ success: boolean }>;
  getName: () => Promise<{ success: boolean; name: string }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
