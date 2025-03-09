import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { eq } from "drizzle-orm";
import fs from "fs";
import { isDevelopment } from "./util.js";
import { getMedsPath, getPreloadPath } from "./pathResolver.js";
import { db } from "./index.js";
import { patients, consultations } from "./schema.js";
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
      const [insertedPatient] = await db
        .insert(patients)
        .values(data)
        .returning({ id: patients.id });

      console.log("📢 Patient added with ID:", insertedPatient.id);
      win.webContents.executeJavaScript("console.log('📢 Patient added!');");
      return insertedPatient.id;
    } catch (error) {
      win.webContents.executeJavaScript(
        "console.error('📢 Failed to add patient:', error);"
      );
      throw error;
    }
  });

  ipcMain.handle("getallpatients", async () => {
    const result = await db.select().from(patients);

    const formattedPatients = result.map((patient) => ({
      ...patient,
      date: new Date(patient.createdAt!).toISOString().split("T")[0], // Format date as "YYYY-MM-DD"
    }));

    return formattedPatients;
  });

  ipcMain.handle("getpatient", async (_, id) => {
    console.log("📢 getpatient IPC received for ID:", id);
    try {
      // Fetch patient by ID
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, id));

      if (!patient) {
        throw new Error("Patient not found");
      }
      const formattedPatient = {
        ...patient,
        createdAt: new Date(patient[0].createdAt!).toISOString().split("T")[0], // Format date as "YYYY-MM-DD"
      };

      console.log("📢 Patient data fetched:", formattedPatient);
      return formattedPatient;
    } catch (error) {
      console.error("📢 Failed to fetch patient:", error);
      throw error; // Rethrow error to be caught in preload
    }
  });

  ipcMain.handle("get-medications", () => {
    const medsPath = getMedsPath();

    return new Promise((resolve, reject) => {
      fs.readFile(medsPath, "utf-8", (err, data) => {
        if (err) {
          console.error("Failed to read JSON:", err);
          return reject(err);
        }

        try {
          const rawMedications = JSON.parse(data);
          // Map French keys to English keys
          /* eslint-disable  @typescript-eslint/no-explicit-any */
          const medications = rawMedications.map((med: any) => ({
            name: med["NOM DE MARQUE"] || "N/A",
            form: med["FORME"] || "N/A",
            dosage: med["DOSAGE"] || "N/A",
          }));

          console.log(medications); // Log for debugging
          resolve(medications);
        } catch (parseErr) {
          console.error("Failed to parse JSON:", parseErr);
          reject(parseErr);
        }
      });
    });
  });

  ipcMain.handle("add-consultation", async (_, data) => {
    await db.insert(consultations).values(data);
  });
  ipcMain.handle("get-consultations", async (_, patientId) => {
    const result = await db
      .select()
      .from(consultations)
      .where(eq(consultations.patientId, patientId));
    return result;
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
