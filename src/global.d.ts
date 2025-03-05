export interface IElectronAPI {
  addPatient: (data: unknown) => Promise<void>;
  getallpatients(): Patient[];
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
