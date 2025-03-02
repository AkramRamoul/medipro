import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { db } from "./index.js";
import { patients } from "./schema.js";
app.on("ready", () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: getPreloadPath(),
    },
  });

  win.maximize();
  win.show();

  if (isDevelopment()) {
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
  }
  ipcMain.handle("addpatient", async (_, data) => {
    console.log("📢 addpatient IPC received:", data);
    try {
      await db.insert(patients).values(data);
      win.webContents.executeJavaScript("console.log('📢 Patient added!');");
    } catch (error) {
      win.webContents.executeJavaScript(
        "console.error('📢 Failed to add patient:', error);"
      );
      throw error; // Rethrow error to be caught in preload
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "allow" }));
  // win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       "Content-Security-Policy": [
  //         "default-src 'self'; script-src 'self' 'unsafe-inline'",
  //       ],
  //     },
  //   });
  // });
});
