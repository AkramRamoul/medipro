import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { desc, eq, sql } from "drizzle-orm";
import fs from "fs";
import { isDevelopment } from "./util.js";
import { getMedsPath } from "./pathResolver.js";
import { db } from "./index.js";
import {
  patients,
  consultations,
  prescriptions,
  prescriptionMedications,
  image,
  prescriptionModel,
} from "./schema.js";
app.on("ready", () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "dist-electron", "preload.cjs"),
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
    const result = await db
      .select({
        id: patients.id,
        firstname: patients.first_name,
        lastname: patients.last_name,
        age: patients.age,
        gender: patients.gender,
        contact: patients.contact,
        address: patients.address,
        weight: patients.weight,
        bloodType: patients.bloodType,
        medicalHistory: patients.medicalHistory,
        allergies: patients.allergies,
        notes: patients.notes,
        createdAt: patients.createdAt,
        lastVisit: sql`MAX(consultations.date)`.as("lastVisit"),
      })
      .from(patients)
      .leftJoin(consultations, eq(patients.id, consultations.patientId))
      .groupBy(patients.id); // Ensure we get one row per patient

    const formattedPatients = result.map((patient) => ({
      ...patient,
      createdAt: new Date(patient.createdAt!).toISOString().split("T")[0], // Format created_at
      lastVisit:
        patient.lastVisit && typeof patient.lastVisit === "string"
          ? new Date(patient.lastVisit).toISOString().split("T")[0]
          : null, // Ensure lastVisit is null if no visits
    }));

    return formattedPatients;
  });

  ipcMain.handle("delete-consultaion", async (_, id) => {
    try {
      await db.delete(consultations).where(eq(consultations.id, id));
    } catch (error) {
      win.webContents.executeJavaScript(
        "console.error('📢 Failed to add patient:', error);"
      );
      throw error;
    }
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
          /* eslint-disable  @typescript-eslint/no-explicit-any */
          const medications = rawMedications.map((med: any) => ({
            name: med["NOM DE MARQUE"] || "N/A",
            form: med["FORME"] || "N/A",
            dosage: med["DOSAGE"] || "N/A",
            note: med["NOTE"] || "N/A",
            quantity: med["QUANTITE"] || "N/A",
            duration: med["DUREE"] || "N/A",
          }));

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
  ipcMain.handle("get-consultation", async (_, id) => {
    const result = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));
    return result;
  });
  ipcMain.handle("get-consultations", async (_, patientId) => {
    const result = await db
      .select()
      .from(consultations)
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.date));
    return result;
  });

  ipcMain.handle("get-patient-prescriptions", async (_, patientId) => {
    try {
      const result = await db
        .select({
          prescriptionId: prescriptions.id,
          date: prescriptions.date,
          medications: prescriptionMedications, // Include medications
        })
        .from(prescriptions)
        .leftJoin(
          prescriptionMedications,
          eq(prescriptions.id, prescriptionMedications.prescriptionId)
        )
        .where(eq(prescriptions.patientId, patientId))
        .orderBy(desc(prescriptions.date));

      // Group medications by prescription ID
      const prescriptionsMap = new Map();

      result.forEach((row) => {
        if (!prescriptionsMap.has(row.prescriptionId)) {
          prescriptionsMap.set(row.prescriptionId, {
            id: row.prescriptionId,
            date: row.date,
            medications: [],
          });
        }
        if (row.medications) {
          prescriptionsMap
            .get(row.prescriptionId)
            .medications.push(row.medications);
        }
      });

      return Array.from(prescriptionsMap.values());
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      return [];
    }
  });
  ipcMain.handle("delete-prescription", async (__dirname, id) => {
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
  });

  ipcMain.handle("edit-consultation", async (_, data) => {
    const { id, ...rest } = data;
    await db.update(consultations).set(rest).where(eq(consultations.id, id));
  });
  ipcMain.handle(
    "addFullPrescription",
    async (_event, { patientId, medications }) => {
      try {
        if (
          !patientId ||
          !Array.isArray(medications) ||
          medications.length === 0
        ) {
          throw new Error("Invalid prescription data");
        }

        // 1️⃣ Insert a new prescription (returns the ID)
        const [newPrescription] = await db
          .insert(prescriptions)
          .values({ patientId })
          .returning({ id: prescriptions.id });

        if (!newPrescription) {
          throw new Error("Failed to create prescription record.");
        }

        // 2️⃣ Insert related medications
        const medicationRecords = medications.map((med) => ({
          prescriptionId: newPrescription.id,
          medicineName: med.medicineName,
          dosage: med.dosage,
          duration: med.duration,
          quantity: med.quantity,
          form: med.form,
          note: med.note,
        }));

        await db.insert(prescriptionMedications).values(medicationRecords);

        return { success: true, message: "Prescription saved successfully!" };
      } catch (error) {
        console.error("Error adding prescription:", error);
        return { success: false };
      }
    }
  );
  ipcMain.handle("edit-patient", async (_, data) => {
    try {
      const { id, ...rest } = data;
      await db.update(patients).set(rest).where(eq(patients.id, id));
      return { success: true };
    } catch (error) {
      console.error("Database Update Error:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("upload-image", async (_, imageDataUrl) => {
    try {
      const destDir = path.join(app.getPath("userData"), "images");
      fs.mkdirSync(destDir, { recursive: true });

      const matches = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 image format");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const fileExt = mimeType.split("/")[1]; // "jpeg", "png", etc.
      const uniqueName = `${Date.now()}.${fileExt}`;
      const destPath = path.join(destDir, uniqueName);

      // Convert base64 to binary and write to file
      fs.writeFileSync(destPath, Buffer.from(base64Data, "base64"));

      await db.insert(image).values({ imagePath: destPath });
      return { success: true, path: destPath };
    } catch (err) {
      console.error("📢 Image upload failed:", err);
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle("save-prescription-model", async (_, formData) => {
    try {
      const {
        nameFr,
        nameAr,
        specialtyFr,
        specialtyAr,
        inscriptionNumber,
        services,
      } = formData;

      const servicesFr = services.map((s: any) => s.fr);
      const servicesAr = services.map((s: any) => s.ar);

      const existing = await db.select().from(prescriptionModel).limit(1);

      if (existing.length === 0) {
        // First time creation
        await db.insert(prescriptionModel).values({
          nameFr,
          nameAr,
          specialtyFr,
          specialtyAr,
          inscriptionNumber,
          servicesFr: JSON.stringify(servicesFr),
          servicesAr: JSON.stringify(servicesAr),
        });
      } else {
        // Update the existing row
        await db
          .update(prescriptionModel)
          .set({
            nameFr,
            nameAr,
            specialtyFr,
            specialtyAr,
            inscriptionNumber,
            servicesFr: JSON.stringify(servicesFr),
            servicesAr: JSON.stringify(servicesAr),
          })
          .where(eq(prescriptionModel.id, existing[0].id));
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Failed to save or update prescription model:", err);
      return { success: false, error: (err as Error).message };
    }
  });
  ipcMain.handle("get-prescription-model", async () => {
    try {
      const [model] = await db.select().from(prescriptionModel).limit(1);
      return { success: true, model };
    } catch (err) {
      return { success: false, error: (err as Error).message };
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
