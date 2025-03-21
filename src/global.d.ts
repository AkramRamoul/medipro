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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
