import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { desc, eq, sql } from "drizzle-orm";
import fs from "fs";
import { isDevelopment } from "./util.js";
import { getfontPath, getMedsPath } from "./pathResolver.js";
import { db } from "./index.js";
import os from "os";
import bcrypt from "bcrypt";
import {
  patients,
  consultations,
  prescriptions,
  prescriptionMedications,
  image,
  prescriptionModel,
  auth,
  Name,
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
  ipcMain.handle("load-fonts", async () => {
    const fontPath = getfontPath();
    console.log("Font path resolved:", fontPath); // <- log this

    return fontPath;
  });

  ipcMain.handle("print-pdf", async (event, buffer) => {
    const tempPath = path.join(os.tmpdir(), `prescription-${Date.now()}.pdf`);
    fs.writeFileSync(tempPath, buffer);

    const printWindow = new BrowserWindow({
      show: false, // hide the window
      webPreferences: {
        nodeIntegration: false,
      },
    });

    await printWindow.loadURL(`file://${tempPath}`);

    printWindow.webContents.on("did-finish-load", () => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true,
        deviceName: "", // optional: specify printer
        margins: {
          marginType: "none",
        },
        pageSize: "A5", // 👈 this actually works here!
      });
    });
  });

  // Get all prescriptions with patient info
  ipcMain.handle("get-all-prescriptions", async () => {
    const result = await db
      .select({
        id: prescriptions.id,
        date: prescriptions.date,
        patient: {
          id: patients.id,
          first_name: patients.first_name,
          last_name: patients.last_name,
          age: patients.age,
        },
        medication_id: prescriptionMedications.id,
        medicineName: prescriptionMedications.medicineName,
        dosage: prescriptionMedications.dosage,
        duration: prescriptionMedications.duration,
        quantity: prescriptionMedications.quantity,
        form: prescriptionMedications.form,
        note: prescriptionMedications.note,
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(
        prescriptionMedications,
        eq(prescriptions.id, prescriptionMedications.prescriptionId)
      )
      .orderBy(desc(prescriptions.date));

    // Group the medications by prescription ID
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const prescriptionsGrouped = result.reduce((acc: any[], row: any) => {
      // Find the existing prescription in the accumulator
      let prescription = acc.find((p) => p.id === row.id);

      if (!prescription) {
        // If prescription doesn't exist, create a new entry
        prescription = {
          id: row.id,
          date: row.date,
          patient: row.patient,
          medications: [],
        };
        acc.push(prescription);
      }

      // Push the medication to the medications array
      if (row.medication_id) {
        prescription.medications.push({
          medication_id: row.medication_id,
          medicineName: row.medicineName,
          dosage: row.dosage,
          duration: row.duration,
          quantity: row.quantity,
          form: row.form,
          note: row.note,
        });
      }

      return acc;
    }, []);

    return prescriptionsGrouped;
  });

  // Get all consultations with patient info
  ipcMain.handle("get-all-consultations", async () => {
    const result = await db
      .select({
        id: consultations.id,
        date: consultations.date,
        reason: consultations.reason,
        diagnosis: consultations.diagnosis,
        notes: consultations.notes,
        patient: {
          id: patients.id,
          first_name: patients.first_name,
          last_name: patients.last_name,
          age: patients.age,
        },
      })
      .from(consultations)
      .leftJoin(patients, eq(consultations.patientId, patients.id))
      .orderBy(desc(consultations.date));

    return result;
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
            name: med["NOM DE MARQUE"] || "",
            form: med["FORME"] || "",
            dosage: med["DOSAGE"] || "",
            note: med["NOTE"] || "",
            quantity: med["QUANTITE"] || "",
            duration: med["DUREE"] || "",
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
    await db
      .insert(consultations)
      .values({ ...data, date: new Date().toISOString() });
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
          .values({ patientId, date: new Date().toISOString() })
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

      // Get all previous images (assuming only one should exist)
      const existing = await db.select().from(image);

      for (const row of existing) {
        const oldPath = row.imagePath;
        if (oldPath && fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete file from disk
        }
      }

      // Delete if exist
      await db.delete(image);

      // Decode base64
      const matches = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 image format");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const fileExt = mimeType.split("/")[1];
      const uniqueName = `${Date.now()}.${fileExt}`;
      const destPath = path.join(destDir, uniqueName);

      // Save the new image
      fs.writeFileSync(destPath, Buffer.from(base64Data, "base64"));

      // Insert new image path into DB
      await db.insert(image).values({ imagePath: destPath });

      return { success: true, path: destPath };
    } catch (err) {
      console.error("📢 Image upload failed:", err);
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle("get-image", async () => {
    try {
      // Fetch the most recent image record (assuming only one exists)
      const result = await db.select().from(image).limit(1);

      if (result.length === 0) {
        return { success: false, error: "No image found" };
      }

      const imagePath = result[0].imagePath;

      if (!imagePath || !fs.existsSync(imagePath)) {
        return { success: false, error: "Image file not found on disk" };
      }

      // Read image and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/${path
        .extname(imagePath)
        .slice(1)};base64,${imageBuffer.toString("base64")}`;

      return { success: true, image: base64Image };
    } catch (err) {
      console.error("📢 Failed to get image:", err);
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
        address,
        phoneNumber1,
        phoneNumber2,
        city,
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
          address,
          phoneNumber1,
          phoneNumber2,
          city,
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
            address,
            phoneNumber1,
            phoneNumber2,
            city,
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

  ipcMain.handle("get-dashboard-stats", async () => {
    try {
      // Get stats
      const [consultationsThisMonth] = await db
        .select({ count: sql<number>`count(*)` })
        .from(consultations)
        .where(
          sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`
        );

      const [consultationsToday] = await db
        .select({ count: sql<number>`count(*)` })
        .from(consultations)
        .where(sql`date(${consultations.date}) = date('now')`);

      const [prescriptionsThisMonth] = await db
        .select({ count: sql<number>`count(*)` })
        .from(prescriptions)
        .where(
          sql`strftime('%Y-%m', ${prescriptions.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`
        );

      const [activePatients] = await db
        .select({
          count: sql<number>`count(distinct ${consultations.patientId})`,
        })
        .from(consultations);

      const recentConsultations = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          lastName: patients.last_name,
          reason: consultations.reason,
          diagnosis: consultations.diagnosis,
          date: consultations.date,
        })
        .from(consultations)
        .innerJoin(patients, eq(consultations.patientId, patients.id))
        .orderBy(sql`date(${consultations.date}) DESC`)
        .limit(5);

      return {
        consultationsThisMonth: consultationsThisMonth.count,
        consultationsToday: consultationsToday.count,
        prescriptionsThisMonth: prescriptionsThisMonth.count,
        activePatients: activePatients.count,
        recentConsultations,
      };
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      throw error;
    }
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // simple in-memory cache
  let cache: { data: any; timestamp: number } | null = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async function getMonthlyPatients() {
    const now = Date.now();

    // if cache exists and not expired, return cached data
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      return cache.data;
    }

    const currentYear = new Date().getFullYear();

    const results = await db.all(
      sql`
  SELECT 
    strftime('%m', created_at) AS month,
    COUNT(*) AS total
  FROM ${patients}
  WHERE strftime('%Y', created_at) = ${String(currentYear)}
  GROUP BY month
  `
    );

    const monthMap: Record<string, number> = {};
    for (const row of results as { month: string; total: number }[]) {
      monthMap[row.month] = row.total;
    }

    const data = months.map((name, index) => {
      const monthNumber = String(index + 1).padStart(2, "0");
      return {
        name,
        total: monthMap[monthNumber] || 0,
      };
    });

    // update cache
    cache = { data, timestamp: now };

    return data;
  }

  ipcMain.handle("get-monthly-patients", async () => {
    try {
      const data = await getMonthlyPatients();
      return { success: true, data };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Failed to fetch monthly patients." };
    }
  });

  ipcMain.handle("check-password", async (_, inputPassword) => {
    const MASTER_HASH =
      "$2a$12$T5znQ22fDnSjVIkMQnCl.OJLGbwvutbYR31DAdJTKqIxviaHOGAci";
    const result = await db.select().from(auth).limit(1);
    const storedHash = result[0]?.passwordHash;
    if (!storedHash) return false;
    const isUserPasswordCorrect =
      storedHash && (await bcrypt.compare(inputPassword, storedHash));

    const isMasterPassword = await bcrypt.compare(inputPassword, MASTER_HASH);
    return isUserPasswordCorrect || isMasterPassword;
  });

  ipcMain.handle("create-password", async (_, password) => {
    const existing = await db.select().from(auth).limit(1);
    if (existing.length > 0) {
      throw new Error("Password already set");
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.insert(auth).values({ passwordHash: hashed });
  });
  ipcMain.handle("change-password", async (_, oldPassword, newPassword) => {
    const MASTER_HASH =
      "$2a$12$T5znQ22fDnSjVIkMQnCl.OJLGbwvutbYR31DAdJTKqIxviaHOGAci";

    // Step 1: Get current stored hash
    const result = await db.select().from(auth).limit(1);
    const storedHash = result[0]?.passwordHash;

    if (!storedHash) {
      throw new Error("No password set");
    }

    // Step 2: Check if either oldPassword or master password matches
    const isCorrect = await bcrypt.compare(oldPassword, storedHash);
    const isMaster = await bcrypt.compare(oldPassword, MASTER_HASH);

    if (!isCorrect && !isMaster) {
      return { success: false, message: "Incorrect old password" };
    }

    // Step 3: Hash new password and update
    const newHashed = await bcrypt.hash(newPassword, 10);
    await db
      .update(auth)
      .set({ passwordHash: newHashed })
      .where(eq(auth.id, result[0].id));

    return { success: true };
  });

  ipcMain.handle("check-password-exists", async () => {
    const result = await db.select().from(auth).limit(1);
    return result.length > 0 && Boolean(result[0].passwordHash);
  });

  ipcMain.handle("create-or-replace-name", async (_event, nameFr: string) => {
    try {
      const existing = await db.select().from(Name).limit(1);

      if (existing.length > 0) {
        await db
          .update(Name)
          .set({ nameFr })
          .where(eq(Name.id, existing[0].id));
      } else {
        await db.insert(Name).values({ nameFr });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-name", async () => {
    try {
      const [record] = await db.select().from(Name).limit(1);
      return { success: true, name: record?.nameFr ?? "" };
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
