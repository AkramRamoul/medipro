import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDevelopment } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";

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
    return "Patient added!";
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
