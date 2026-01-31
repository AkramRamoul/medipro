const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  addPatient: async (data: unknown) => {
    return await ipcRenderer.invoke("addpatient", data);
  },
  getallpatients: async () => {
    try {
      return await ipcRenderer.invoke("getallpatients");
    } catch (error) {
      console.error("📢 Failed to fetch patients in renderer:", error);
      return [];
    }
  },
  getMedications: () => ipcRenderer.invoke("get-medications"),
  getpatient: async (id: number) => {
    try {
      return await ipcRenderer.invoke("getpatient", id);
    } catch (error) {
      console.error("📢 Failed to fetch patient:", error);
      return null;
    }
  },
  addConsultation: async (data: unknown) => {
    return await ipcRenderer.invoke("add-consultation", data);
  },
  getConsultations: async (id: number) => {
    try {
      return await ipcRenderer.invoke("get-consultations", id);
    } catch (error) {
      console.error("📢 Failed to fetch consultations:", error);
      return [];
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
    try {
      return await ipcRenderer.invoke("get-consultation", id);
    } catch (error) {
      console.error("📢 Failed to fetch consultation:", error);
      return [];
    }
  },
  getPatientPrescriptions: async (id: number) => {
    try {
      return await ipcRenderer.invoke("get-patient-prescriptions", id);
    } catch (error) {
      console.error("📢 Failed to fetch prescriptions:", error);
      return [];
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
    try {
      return await ipcRenderer.invoke("edit-consultation", data);
    } catch (error) {
      console.error("Failed to edit consultation:", error);
    }
  },
  editPatient: async (data: unknown) =>
    ipcRenderer.invoke("edit-patient", data),
  deletePatient: async (id: number) => {
    return await ipcRenderer.invoke("delete-patient", id);
  },
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
  savePdf: (buffer: any, filename: string) => {
    return ipcRenderer.invoke("save-pdf", { buffer, filename });
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
      newPassword,
    );
  },
  removePassword: async (password: string) => {
    return await ipcRenderer.invoke("remove-password", password);
  },
  createName: async (nameFr: string) => {
    return await ipcRenderer.invoke("create-or-replace-name", nameFr);
  },
  getName: async () => {
    return await ipcRenderer.invoke("get-name");
  },
  getNextPsychotropicNumber: () =>
    ipcRenderer.invoke("get-next-psychotropic-number"),
  createDocument: async (data: unknown) => {
    return await ipcRenderer.invoke("create-document", data);
  },
  getPatientDocuments: async (patientId: number) => {
    return await ipcRenderer.invoke("get-patient-documents", patientId);
  },
  deleteDocument: async (id: number) => {
    return await ipcRenderer.invoke("delete-document", id);
  },
  backup: () => ipcRenderer.invoke("db:backup"),
  restore: () => ipcRenderer.invoke("db:restore"),
  getPatientTimeline: async (patientId: number) => {
    return await ipcRenderer.invoke("get-patient-timeline", patientId);
  },
  addAppointment: async (data: unknown) => {
    return await ipcRenderer.invoke("add-appointment", data);
  },
  getAppointments: async (patientId: number) => {
    return await ipcRenderer.invoke("get-appointments", patientId);
  },
  getAllAppointments: async () => {
    return await ipcRenderer.invoke("get-all-appointments");
  },
  deleteAppointment: async (id: number) => {
    return await ipcRenderer.invoke("delete-appointment", id);
  },
  submitLicense: (key: string, payload: object) =>
    ipcRenderer.invoke("validate-license", key, payload),
  getStoredLicense: () => ipcRenderer.invoke("get-license"),
  getMachineId: () => ipcRenderer.invoke("get-machine-id"),
  getAppInitData: () => ipcRenderer.invoke("get-app-init-data"),
  resetLicense: () => ipcRenderer.invoke("reset-license"),
  getCustomFields: async () => {
    try {
      return await ipcRenderer.invoke("get-custom-fields");
    } catch (error) {
      console.error("📢 Failed to fetch custom fields:", error);
      return [];
    }
  },
  addCustomField: async (data: unknown) => {
    return await ipcRenderer.invoke("add-custom-field", data);
  },
  deleteCustomField: async (id: number) => {
    return await ipcRenderer.invoke("delete-custom-field", id);
  },
  getPrescriptionTemplates: async () => {
    return await ipcRenderer.invoke("get-prescription-templates");
  },
  addPrescriptionTemplate: async (data: any) => {
    return await ipcRenderer.invoke("add-prescription-template", data);
  },
  deletePrescriptionTemplate: async (id: number) => {
    return await ipcRenderer.invoke("delete-prescription-template", id);
  },
});
