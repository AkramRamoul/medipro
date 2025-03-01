export interface IElectronAPI {
  addpatient: (data: unknown) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
