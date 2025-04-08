export interface IElectronAPI {
  addPatient: (data: unknown) => Promise<void>;
  getallpatients(): Patient[];
  getpatient(id: string): Patient | null;
  getMedications: () => Promise<
    { name: string; form: string; dosage: string }[]
  >;
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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
