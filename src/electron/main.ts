import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url"; // ✅ Needed for ESM

// ✅ Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"), // ✅ Make sure this is correct
      nodeIntegration: false, // Keep it secure
      contextIsolation: true, // ✅ Required for contextBridge to work
    },
  });

  win.maximize();
  win.show();

  win.loadURL("http://localhost:5123");

  ipcMain.handle("addpatient", async (_, data) => {
    console.log("📢 addpatient IPC received:", data);
    return "Patient added!";
  });
};

app.whenReady().then(createWindow);
