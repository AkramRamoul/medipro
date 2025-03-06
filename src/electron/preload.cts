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
});
