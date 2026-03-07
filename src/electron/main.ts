import "dotenv/config";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  utilityProcess,
  type MenuItemConstructorOptions,
} from "electron";
import path from "path";
import fs from "fs";
import { isDevelopment } from "./util.js";
import {
  getfontPath,
} from "./pathResolver.js";

// Global window and process management
let mainWindow: BrowserWindow | null = null;
let backendProcess: any = null;

function initializeAssets() {
  const isBundled = app.isPackaged;
  if (!isBundled) return;

  const userDataPath = app.getPath("userData");
  const assets = ["common_bilans.json", "common_consultations.json", "meds.json", "database.db"];

  assets.forEach((asset) => {
    const destPath = path.join(userDataPath, asset);
    if (!fs.existsSync(destPath)) {
      const srcPath = path.join(process.resourcesPath, asset);
      if (fs.existsSync(srcPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          // Ensure writable (remove read-only attribute if copied)
          fs.chmodSync(destPath, 0o666);
          console.log(`[Electron] Asset initialized: ${asset}`);
        } catch (err) {
          console.error(`[Electron] Failed to initialize asset ${asset}:`, err);
        }
      } else {
        console.warn(`[Electron] Asset source NOT FOUND: ${srcPath}`);
      }
    }
  });
}

function startBackend() {
  const isBundled = app.isPackaged;
  initializeAssets();
  const backendPath = isBundled
    ? path.join(process.resourcesPath, "app.asar.unpacked", "backend", "server-bundle.js")
    : path.join(app.getAppPath(), "backend", "server-bundle.js");

  const logFilePath = path.join(app.getPath("userData"), "backend-error.log");

  console.log(`[Electron] Starting backend from: ${backendPath}`);
  console.log(`[Electron] Backend log file: ${logFilePath}`);

  if (!fs.existsSync(backendPath)) {
    console.error(`[Electron] Backend bundle NOT FOUND at: ${backendPath}`);
    fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] [Electron] Backend bundle NOT FOUND at: ${backendPath}\n`);
    return;
  }

  try {
    backendProcess = utilityProcess.fork(backendPath, [], {
      stdio: "pipe",
      cwd: path.dirname(backendPath),
      env: {
        ...process.env,
        NODE_ENV: isBundled ? "production" : "development",
        PORT: "3001",
        BACKEND_LOG_FILE: logFilePath,
        IS_PACKAGED_ELECTRON: isBundled ? "true" : "false",
        RESOURCES_PATH: process.resourcesPath,
        USER_DATA_PATH: app.getPath("userData"),
        DATABASE_PATH: isBundled
          ? path.join(app.getPath("userData"), "database.db")
          : path.join(app.getAppPath(), "database.db")
      }
    });

    backendProcess.stdout?.on("data", (data: any) => {
      const msg = data.toString();
      console.log(`[Backend] ${msg}`);
    });

    backendProcess.stderr?.on("data", (data: any) => {
      const msg = data.toString();
      console.error(`[Backend Internal] ${msg}`);
      fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] [Backend Stderr] ${msg}`);
    });

    backendProcess.on("exit", (code: number) => {
      console.log(`[Electron] Backend process exited with code ${code}`);
      fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] [Electron] Backend process exited with code ${code}\n`);
    });

    backendProcess.on("spawn", () => {
      console.log("[Electron] Backend process spawned successfully");
    });

    backendProcess.on("error", (err: any) => {
      console.error("[Electron] Backend process error:", err);
      fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] [Electron] Backend process error: ${err.stack || err}\n`);
    });
  } catch (err: any) {
    console.error("[Electron] Exception during startBackend:", err);
    fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] [Electron] Exception during startBackend: ${err.stack || err}\n`);
  }
}
ipcMain.handle("load-fonts", async () => {
  const fontPath = getfontPath();

  return fontPath;
});



function setAppMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
        {
          label: app.name,
          submenu: [
            { role: "about", label: "À propos de DocRight" },
            { type: "separator" },
            { role: "services", label: "Services" },
            { type: "separator" },
            { role: "hide", label: "Masquer DocRight" },
            { role: "hideOthers", label: "Masquer les autres" },
            { role: "unhide", label: "Tout afficher" },
            { type: "separator" },
            { role: "quit", label: "Quitter DocRight" },
          ],
        },
      ] as MenuItemConstructorOptions[])
      : []),
    {
      label: "Fichier",
      submenu: [
        { type: "separator" },
        (isMac
          ? { role: "close", label: "Fermer" }
          : { role: "quit", label: "Quitter" }) as MenuItemConstructorOptions,
      ],
    },
    {
      label: "Édition",
      submenu: [
        { role: "undo", label: "Annuler" },
        { role: "redo", label: "Rétablir" },
        { type: "separator" },
        { role: "cut", label: "Couper" },
        { role: "copy", label: "Copier" },
        { role: "paste", label: "Coller" },
        { role: "selectAll", label: "Tout sélectionner" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { role: "reload", label: "Actualiser" },
        { role: "forceReload", label: "Forcer l'actualisation" },
        { role: "togglefullscreen", label: "Plein écran" },
        { role: "toggleDevTools", label: "Outils de développement" },
        { type: "separator" },
        { role: "resetZoom", label: "Réinitialiser le zoom" },
        { role: "zoomIn", label: "Zoom avant" },
        { role: "zoomOut", label: "Zoom arrière" },
      ],
    },
    {
      label: "Fenêtre",
      submenu: [
        { role: "minimize", label: "Réduire" },
        { role: "close", label: "Fermer" },
      ],
    },
    {
      label: "Aide",
      submenu: [
        {
          label: "À propos",
          click: async () => {
            await dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "À propos",
              message: "DocRight",
              detail: `Version ${app.getVersion()}`,
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on("ready", async () => {
  startBackend();

  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "dist-electron", "preload.cjs"),
    },
  });

  mainWindow.maximize();
  mainWindow.show();
  setAppMenu(mainWindow);

  if (isDevelopment()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    const backendUrl = "http://localhost:3001";
    const maxRetries = 30; // 30 * 500ms = 15 seconds
    let ready = false;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const http = await import("http");
        await new Promise<void>((resolve, reject) => {
          const req = http.default.get(`${backendUrl}/api/health`, (res) => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
              resolve();
            } else {
              reject(new Error(`Status ${res.statusCode}`));
            }
          });
          req.on("error", reject);
          req.setTimeout(1000, () => { req.destroy(); reject(new Error("timeout")); });
        });
        ready = true;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (ready) {
      mainWindow.loadURL(backendUrl);
    } else {
      console.error("[Electron] Backend failed to start within 15 seconds");
      mainWindow.loadURL(`data:text/html,<h2>Error: Backend server failed to start.</h2><p>Check logs for details.</p>`);
    }
  }

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "allow" }));
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
