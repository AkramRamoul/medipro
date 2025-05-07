const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ Preload script loaded!"); // Debugging log

// Combine both methods into a single exposeInMainWorld call
contextBridge.exposeInMainWorld("electronAPI", {
  addPatient: async (data: unknown) => {
    console.log("📢 Sending data to main process:", data);
    return await ipcRenderer.invoke("addpatient", data);
  },
  getallpatients: async () => {
    try {
      return await ipcRenderer.invoke("getallpatients");
    } catch (error) {
      console.error("📢 Failed to fetch patients in renderer:", error);
      return []; // Return an empty array if an error occurs
    }
  },
  getMedications: () => ipcRenderer.invoke("get-medications"),
  getpatient: async (id: number) => {
    console.log("📢 Fetching patient with ID:", id);
    try {
      return await ipcRenderer.invoke("getpatient", id);
    } catch (error) {
      console.error("📢 Failed to fetch patient:", error);
      return null; // Return null if an error occurs
    }
  },
  addConsultation: async (data: unknown) => {
    console.log("📢 Sending data to main process:", data);
    return await ipcRenderer.invoke("add-consultation", data);
  },
  getConsultations: async (id: number) => {
    console.log("📢 Fetching consultations for patient ID:", id);
    try {
      return await ipcRenderer.invoke("get-consultations", id);
    } catch (error) {
      console.error("📢 Failed to fetch consultations:", error);
      return []; // Return an empty array if an error occurs
    }
  },
  deleteCosultaion: async (id: number) => {
    try {
      return await ipcRenderer.invoke("delete-consultaion", id);
    } catch (error) {
      console.error("📢 Failed to fetch consultations:", error);
    }
  },
  getConsultation: async (id: number) => {
    console.log("📢 Fetching consultation with ID:", id);
    try {
      return await ipcRenderer.invoke("get-consultation", id);
    } catch (error) {
      console.error("📢 Failed to fetch consultation:", error);
      return []; // Return empty array if an error occurs
    }
  },
  getPatientPrescriptions: async (id: number) => {
    console.log("📢 Fetching prescriptions for patient ID:", id);
    try {
      return await ipcRenderer.invoke("get-patient-prescriptions", id);
    } catch (error) {
      console.error("📢 Failed to fetch prescriptions:", error);
      return []; // Return an empty array if an error occurs
    }
  },
  addFullPrescription: (data: unknown) =>
    ipcRenderer.invoke("addFullPrescription", data),
  deletePrescription: async (id: number) => {
    try {
      return ipcRenderer.invoke("delete-prescription", id);
    } catch (error) {
      console.error("failed to delete prescription", error);
    }
  },
  editConsultation: async (data: unknown) => {
    console.log("Sending data to main process:", data);
    try {
      return await ipcRenderer.invoke("edit-consultation", data);
    } catch (error) {
      console.error("Failed to edit consultation:", error);
    }
  },
  editPatient: async (data: unknown) =>
    ipcRenderer.invoke("edit-patient", data),
  uploadImage: async (data: unknown) => {
    return await ipcRenderer.invoke("upload-image", data);
  },
  savePrescriptionModel: async (data: unknown) => {
    return await ipcRenderer.invoke("save-prescription-model", data);
  },
  getPrescriptionModel: async () => {
    return await ipcRenderer.invoke("get-prescription-model");
  },
  getImage: async () => {
    return await ipcRenderer.invoke("get-image");
  },
  getDashboardStats: async () => {
    return await ipcRenderer.invoke("get-dashboard-stats");
  },
  loadFonts: async () => {
    return await ipcRenderer.invoke("load-fonts");
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  printPdf: (buffer: any) => {
    return ipcRenderer.invoke("print-pdf", buffer);
  },
  getAllPrescriptions: async () => {
    return await ipcRenderer.invoke("get-all-prescriptions");
  },
  getAllConsultations: async () => {
    return await ipcRenderer.invoke("get-all-consultations");
  },
  getMonthlyPatients: async () => {
    return await ipcRenderer.invoke("get-monthly-patients");
  },
  createPassword: async (password: string) => {
    return await ipcRenderer.invoke("create-password", password);
  },
  checkPassword: async (password: string) => {
    return await ipcRenderer.invoke("check-password", password);
  },
  checkPasswordExists: () => ipcRenderer.invoke("check-password-exists"),
  changePassword: async (oldPassword: string, newPassword: string) => {
    return await ipcRenderer.invoke(
      "change-password",
      oldPassword,
      newPassword
    );
  },
  createName: async (nameFr: string) => {
    return await ipcRenderer.invoke("create-or-replace-name", nameFr);
  },
  getName: async () => {
    return await ipcRenderer.invoke("get-name");
  },
});
