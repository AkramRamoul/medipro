export interface IElectronAPI {
  addPatient: (data: unknown) => Promise<void>;
  getallpatients(): Patient[];
  getpatient(id: string): Patient | null;
  getMedications: () => Promise<
    { name: string; form: string; dosage: string }[]
  >;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
