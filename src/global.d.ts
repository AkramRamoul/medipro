export interface IElectronAPI {
  addPatient: (data: unknown) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
