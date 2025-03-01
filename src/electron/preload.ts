// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ Preload script loaded!"); // Debugging log

contextBridge.exposeInMainWorld("electronAPI", {
  addPatient: async (data: unknown) => {
    console.log("📢 Sending data to main process:", data);
    return await ipcRenderer.invoke("addpatient", data);
  },
});
