import "dotenv/config";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";
import path from "path";
import { desc, eq, sql, or, like } from "drizzle-orm";
import fs from "fs";
import { isDevelopment } from "./util.js";
import {
  getfontPath,
  getMedsPath,
  getBilansPath,
  getConsultationsPath,
} from "./pathResolver.js";
import { db } from "./index.js";
import os from "os";
import bcrypt from "bcrypt";
import { openDB } from "./db.js";
import { dbUrl } from "./database-path.js";

import {
  patients,
  consultations,
  prescriptions,
  prescriptionMedications,
  image,
  prescriptionModel,
  auth,
  Name,
  psychotropicCounters,
  Document,
  appointments,
  customFields,
  prescriptionTemplates,
  prescriptionTemplateMedications,
  documentTemplates,
  expenses,
} from "./schema.js";
import { restoreDatabase } from "./restore.js";
import { backupDatabase } from "./bdBackup.js";
import pkg from "node-machine-id";
import { validateLicenseKey } from "./validate-license.js";
import { getLicense, resetLicense, saveLicense } from "./LicenseStore.js";
const { machineIdSync } = pkg;

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
        {
          label: "Sauvegarder la base de données...",
          click: async () => {
            const { canceled, filePath } = await dialog.showSaveDialog({
              title: "Sauvegarder la base de données",
              defaultPath: `backup-${Date.now()}.db`,
              filters: [{ name: "Base de données", extensions: ["db"] }],
            });

            if (canceled || !filePath) return;

            try {
              await backupDatabase(filePath);
            } catch (error) {
              dialog.showErrorBox(
                "Échec de la sauvegarde",
                error instanceof Error ? error.message : "Erreur inconnue",
              );
            }
          },
        },
        {
          label: "Restaurer la base de données...",
          click: async () => {
            const confirm = await dialog.showMessageBox(mainWindow, {
              type: "warning",
              buttons: ["Annuler", "Restaurer"],
              defaultId: 0,
              cancelId: 0,
              title: "Restaurer la base de données",
              message:
                "La restauration remplacera les données actuelles et redémarrera l'application.",
            });

            if (confirm.response !== 1) return;

            const { canceled, filePaths } = await dialog.showOpenDialog({
              title: "Restaurer la base de données",
              filters: [{ name: "Base de données", extensions: ["db"] }],
              properties: ["openFile"],
            });

            if (canceled || filePaths.length === 0) return;

            try {
              await restoreDatabase(filePaths[0]);
            } catch (error) {
              dialog.showErrorBox(
                "Échec de la restauration",
                error instanceof Error ? error.message : "Erreur inconnue",
              );
            }
          },
        },
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

app.on("ready", () => {
  // Initialize JSON data files in userData if they don't exist (Production only)
  if (!isDevelopment()) {
    const jsonFiles = ["common_bilans.json", "common_consultations.json"];
    jsonFiles.forEach((fileName) => {
      const targetPath = path.join(app.getPath("userData"), fileName);
      try {
        if (!fs.existsSync(targetPath)) {
          const sourcePath = path.join(process.resourcesPath, fileName);
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
          } else {
            fs.writeFileSync(targetPath, JSON.stringify([], null, 2));
          }
        }
        // Ensure the file is writable (important on Windows if copied from read-only source)
        if (fs.existsSync(targetPath)) {
          fs.chmodSync(targetPath, 0o666);
        }
      } catch (err) {
        console.error(
          `Failed to initialize or set permissions for ${fileName}:`,
          err,
        );
      }
    });
  }

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "dist-electron", "preload.cjs"),
    },
  });
  openDB(dbUrl);

  // Ensure new columns exist for prescription personalization
  (async () => {
    try {
      await db.run(sql`ALTER TABLE prescription_model ADD COLUMN accent_color TEXT`);
    } catch (e) { /* ignore if already exists */ }
    try {
      await db.run(sql`ALTER TABLE prescription_model ADD COLUMN font_family TEXT`);
    } catch (e) { /* ignore if already exists */ }
  })();

  win.maximize();
  win.show();
  setAppMenu(win);

  // Preload default templates
  (async () => {
    try {
      const existing = await db.select().from(documentTemplates).limit(1);
      if (existing.length === 0) {
        const defaults = [
          {
            name: "Arrêt de travail",
            type: "work_stop",
            content:
              "<h2>Arrêt de Travail</h2><p>Je soussigné, Dr. [Nom du Médecin], certifie avoir examiné M./Mme <strong>[Nom du Patient]</strong> et que son état de santé nécessite un arrêt de travail de <strong>[Nombre]</strong> jours à compter du <strong>[Date]</strong>.</p><p>Sauf complication, la reprise du travail pourra avoir lieu le [Date de reprise].</p>",
            isDefault: true,
          },
          {
            name: "Certificat Médical d'Aptitude",
            type: "medical_certificate",
            content:
              "<h2>Certificat Médical d'Aptitude</h2><p>Je soussigné, Dr. [Nom du Médecin], certifie que l'état de santé de M./Mme <strong>[Nom du Patient]</strong>, après examen clinique ce jour, ne présente aucune contre-indication apparente à la pratique de <strong>[Activité Sportive/Professionnelle]</strong>.</p><p>Certificat délivré à la demande de l'intéressé(e) pour servir et valoir ce que de droit.</p>",
            isDefault: true,
          },
          {
            name: "Certificat de maladie chronique",
            type: "chronic_disease",
            content:
              "<h2>Certificat de Maladie Chronique</h2><p>Le patient M./Mme <strong>[Nom du Patient]</strong> est suivi régulièrement par notre cabinet pour une pathologie chronique nécessitant un traitement continu et une surveillance médicale régulière.</p><p>Ce certificat est établi pour permettre le suivi de son dossier médical.</p>",
            isDefault: true,
          },
          {
            name: "Lettre d'Orientation",
            type: "custom",
            content:
              "<h2>Lettre d'Orientation</h2><p>Cher confrère,</p><p>Je vous adresse M./Mme <strong>[Nom du Patient]</strong> pour une prise en charge spécialisée concernant <strong>[Motif de la consultation]</strong>.</p><p>Voici les éléments cliniques notables :</p><ul><li>[Élément 1]</li><li>[Élément 2]</li></ul><p>Je vous remercie par avance de votre avis et de la conduite à tenir que vous jugerez nécessaire.</p><p>Confraternellement,</p>",
            isDefault: true,
          },
          {
            name: "Note d'honoraires",
            type: "custom",
            content:
              "<h2>Note d'honoraires</h2><p>Reçu de M./Mme <strong>[Nom du Patient]</strong> la somme de : <strong>[Montant] DA</strong></p><p>Pour : Consultation médicale / Acte médical</p><p>Fait à [Ville], le [Date]</p>",
            isDefault: true,
          },
        ];
        // @ts-expect-error-type
        await db.insert(documentTemplates).values(defaults);
      }

      const existingPrescTemplates = await db
        .select()
        .from(prescriptionTemplates)
        .limit(1);
      if (existingPrescTemplates.length === 0) {
        // Preload some standard prescription templates
        const [grippe] = await db
          .insert(prescriptionTemplates)
          .values({ name: "État Grippal" })
          .returning({ id: prescriptionTemplates.id });
        await db.insert(prescriptionTemplateMedications).values([
          {
            templateId: grippe.id,
            medicineName: "PARACETAMOL 1G",
            dosage: "1 cp 3 fois/jour",
            duration: "5 jours",
            quantity: "1 bte",
            form: "Comprimé",
          },
          {
            templateId: grippe.id,
            medicineName: "VITAMINE C 1000MG",
            dosage: "1 cp le matin",
            duration: "10 jours",
            quantity: "1 bte",
            form: "Comprimé effervescent",
          },
        ]);

        const [hypertension] = await db
          .insert(prescriptionTemplates)
          .values({ name: "Hypertension (Initial)" })
          .returning({ id: prescriptionTemplates.id });
        await db.insert(prescriptionTemplateMedications).values([
          {
            templateId: hypertension.id,
            medicineName: "AMLODIPINE 5MG",
            dosage: "1 cp le soir",
            duration: "3 mois",
            quantity: "3 btes",
            form: "Comprimé",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to preload default templates:", err);
    }
  })();

  if (isDevelopment()) {
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
  }
  ipcMain.handle("addpatient", async (_, data) => {
    try {
      const [insertedPatient] = await db
        .insert(patients)
        .values(data)
        .returning({ id: patients.id });

      return insertedPatient.id;
    } catch (error) {
      win.webContents.executeJavaScript(
        "console.error('📢 Failed to add patient:', error);",
      );
      throw error;
    }
  });
  ipcMain.handle("load-fonts", async () => {
    const fontPath = getfontPath();

    return fontPath;
  });

  ipcMain.handle("print-pdf", async (event, buffer) => {
    const tempPath = path.join(os.tmpdir(), `prescription-${Date.now()}.pdf`);
    fs.writeFileSync(tempPath, buffer);

    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
      },
    });

    await printWindow.loadURL(`file://${tempPath}`);

    printWindow.webContents.on("did-finish-load", () => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true,
        deviceName: "",
        margins: {
          marginType: "none",
        },
        pageSize: "A5",
      });
    });
  });

  ipcMain.handle(
    "print-html",
    async (_, { htmlContent }: { htmlContent: string }) => {
      try {
        const win = new BrowserWindow({
          show: false,
          webPreferences: {
            nodeIntegration: false,
          },
        });

        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
        await win.loadURL(dataUrl);

        return new Promise((resolve) => {
          win.webContents.print(
            {
              silent: false,
              printBackground: true,
              deviceName: "", // default printer
              margins: {
                marginType: "custom",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              },
              pageSize: "A5",
            },
            (success, errorType) => {
              if (!success) {
                console.error("Print failed:", errorType);
                resolve({ success: false, error: errorType });
              } else {
                resolve({ success: true });
              }
              win.close();
            },
          );
        });
      } catch (error) {
        console.error("Failed to print HTML:", error);
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle("save-pdf", async (_, { buffer, filename }) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: filename || "document.pdf",
        filters: [{ name: "PDF Files", extensions: ["pdf"] }],
      });

      if (filePath) {
        fs.writeFileSync(filePath, Buffer.from(buffer));
        return { success: true, filePath };
      }
      return { success: false, error: "Cancelled" };
    } catch (error) {
      console.error("Failed to save PDF:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Get ordonnance with patient info
  ipcMain.handle("get-all-prescriptions", async () => {
    const result = await db
      .select({
        id: prescriptions.id,
        date: prescriptions.prescriptionDate,
        createdAt: prescriptions.createdAt,
        isPsychotropic: prescriptions.is_psychotropic,
        psychotropicNumber: prescriptions.psychotropic_number,
        patientId: prescriptions.patientId,
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
        eq(prescriptions.id, prescriptionMedications.prescriptionId),
      )
      .orderBy(desc(prescriptions.prescriptionDate));

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const prescriptionsGrouped = result.reduce((acc: any[], row: any) => {
      let prescription = acc.find((p) => p.id === row.id);

      if (!prescription) {
        prescription = {
          id: row.id,
          date: row.date,
          createdAt: row.createdAt,
          isPsychotropic: row.isPsychotropic,
          psychotropicNumber: row.psychotropicNumber,
          patient: row.patient,
          medications: [],
        };
        acc.push(prescription);
      }
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
        bloodPressure: consultations.bloodPressure,
        glucose: consultations.glucose,
        weight: consultations.weight,
        customFields: consultations.customFields,
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
        status: patients.status,
        tags: patients.tags,
        lastVisit: sql`MAX(consultations.date)`.as("lastVisit"),
      })
      .from(patients)
      .leftJoin(consultations, eq(patients.id, consultations.patientId))
      .where(sql`${patients.status} != 'deleted'`)
      .groupBy(patients.id);

    const formattedPatients = result.map((patient) => ({
      ...patient,
      createdAt: new Date(patient.createdAt!).toISOString(),
      lastVisit:
        patient.lastVisit && typeof patient.lastVisit === "string"
          ? new Date(patient.lastVisit).toISOString()
          : null,
    }));

    return formattedPatients;
  });

  ipcMain.handle("delete-patient", async (_, id) => {
    try {
      await db
        .update(patients)
        .set({ status: "deleted" })
        .where(eq(patients.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete patient:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("delete-consultaion", async (_, id) => {
    try {
      await db.delete(consultations).where(eq(consultations.id, id));
      invalidateMonthlyPatientsCache();
    } catch (error) {
      win.webContents.executeJavaScript(
        "console.error('Failed to delete consultation:', error);",
      );
      throw error;
    }
  });

  ipcMain.handle("getpatient", async (_, id) => {
    try {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, id));

      if (!patient) {
        throw new Error("Patient not found");
      }
      const formattedPatient = {
        ...patient,
        createdAt: new Date(patient[0].createdAt!).toISOString().split("T")[0], // "YYYY-MM-DD"
      };

      return formattedPatient;
    } catch (error) {
      console.error("📢 Failed to fetch patient:", error);
      throw error;
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
            name: (med["NOM DE MARQUE"] || "").trim(),
            form: (med["FORME"] || "").trim(),
            dosage: (med["DOSAGE"] || "").trim(),
            note: (med["NOTE"] || "").trim(),
            quantity: (med["QUANTITE"] || "").trim(),
            duration: (med["DUREE"] || "").trim(),
          }));

          resolve(medications);
        } catch (parseErr) {
          console.error("Failed to parse JSON:", parseErr);
          reject(parseErr);
        }
      });
    });
  });

  ipcMain.handle("get-bilans", () => {
    const bilansPath = getBilansPath();

    return new Promise((resolve, reject) => {
      fs.readFile(bilansPath, "utf-8", (err, data) => {
        if (err) {
          console.error("Failed to read JSON:", err);
          return reject(err);
        }
        try {
          const bilans = JSON.parse(data);
          resolve(bilans);
        } catch (parseErr) {
          console.error("Failed to parse JSON:", parseErr);
          reject(parseErr);
        }
      });
    });
  });

  ipcMain.handle("update-bilans", async (_, bilans) => {
    const bilansPath = getBilansPath();
    try {
      await fs.promises.writeFile(
        bilansPath,
        JSON.stringify(bilans, null, 4),
        "utf-8",
      );
      return { success: true };
    } catch (error: any) {
      console.error("Failed to write common_bilans.json:", error);
      // If still getting EPERM, try to force permissions again
      if (error.code === "EPERM") {
        try {
          fs.chmodSync(bilansPath, 0o666);
          await fs.promises.writeFile(
            bilansPath,
            JSON.stringify(bilans, null, 4),
            "utf-8",
          );
          return { success: true };
        } catch (chmodError) {
          console.error("Failed to change permissions:", chmodError);
          return {
            success: false,
            error: `Permission error: ${error.message}`,
          };
        }
      }
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-consultations-list", () => {
    const consultationsPath = getConsultationsPath();

    return new Promise((resolve, reject) => {
      fs.readFile(consultationsPath, "utf-8", (err, data) => {
        if (err) {
          console.error("Failed to read common_consultations.json:", err);
          return reject(err);
        }
        try {
          const consultations = JSON.parse(data);
          resolve(consultations);
        } catch (parseErr) {
          console.error("Failed to parse common_consultations.json:", parseErr);
          reject(parseErr);
        }
      });
    });
  });

  ipcMain.handle("update-consultations-list", async (_, consultations) => {
    const consultationsPath = getConsultationsPath();
    try {
      await fs.promises.writeFile(
        consultationsPath,
        JSON.stringify(consultations, null, 4),
        "utf-8",
      );
      return { success: true };
    } catch (error: any) {
      console.error("Failed to write common_consultations.json:", error);
      if (error.code === "EPERM") {
        try {
          fs.chmodSync(consultationsPath, 0o666);
          await fs.promises.writeFile(
            consultationsPath,
            JSON.stringify(consultations, null, 4),
            "utf-8",
          );
          return { success: true };
        } catch (chmodError) {
          console.error("Failed to change permissions:", chmodError);
          return {
            success: false,
            error: `Permission error: ${error.message}`,
          };
        }
      }
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("add-consultation", async (_, data) => {
    const { vitals, ...rest } = data;

    await db.insert(consultations).values({
      ...rest,
      bloodPressure:
        vitals?.bpSystolic && vitals?.bpDiastolic
          ? `${vitals.bpSystolic}/${vitals.bpDiastolic}`
          : null,

      glucose: vitals?.glucose ? Number(vitals.glucose) : null,
      weight: vitals?.weight?.toString() || null,
      amountPaid: data.amountPaid ? Math.round(Number(data.amountPaid)) : null,
      customFields: data.customFields || {},
      date: new Date().toISOString(),
    });
    invalidateMonthlyPatientsCache();
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
          date: prescriptions.prescriptionDate,
          createdAt: prescriptions.createdAt,
          isPsychotropic: prescriptions.is_psychotropic,
          psychotropicNumber: prescriptions.psychotropic_number,
          patientAddress: prescriptions.patient_address,
          medications: prescriptionMedications,
        })
        .from(prescriptions)
        .leftJoin(
          prescriptionMedications,
          eq(prescriptions.id, prescriptionMedications.prescriptionId),
        )
        .where(eq(prescriptions.patientId, patientId))
        .orderBy(desc(prescriptions.prescriptionDate));
      const prescriptionsMap = new Map();

      result.forEach((row) => {
        if (!prescriptionsMap.has(row.prescriptionId)) {
          prescriptionsMap.set(row.prescriptionId, {
            id: row.prescriptionId,
            date: row.date,
            createdAt: row.createdAt,
            isPsychotropic: row.isPsychotropic,
            psychotropicNumber: row.psychotropicNumber,
            patientAddress: row.patientAddress,
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

  ipcMain.handle("get-patient-timeline", async (_, patientId) => {
    try {
      const [patient] = await db
        .select({ createdAt: patients.createdAt })
        .from(patients)
        .where(eq(patients.id, patientId));

      if (!patient) throw new Error("Patient not found");

      const patientConsultations = await db
        .select({
          date: consultations.date,
          reason: consultations.reason,
          diagnosis: consultations.diagnosis,
          notes: consultations.notes,
        })
        .from(consultations)
        .where(eq(consultations.patientId, patientId));

      const patientPrescriptions = await db
        .select({
          id: prescriptions.id,
          date: prescriptions.prescriptionDate,
          medications: prescriptionMedications,
        })
        .from(prescriptions)
        .leftJoin(
          prescriptionMedications,
          eq(prescriptions.id, prescriptionMedications.prescriptionId),
        )
        .where(eq(prescriptions.patientId, patientId));

      const patientDocuments = await db
        .select({
          id: Document.id,
          type: Document.type,
          content: Document.content,
          createdAt: Document.createdAt,
        })
        .from(Document)
        .where(eq(Document.patientId, patientId));

      const prescriptionsMap = new Map();
      patientPrescriptions.forEach((row) => {
        if (!prescriptionsMap.has(row.id)) {
          prescriptionsMap.set(row.id, {
            date: row.date,
            medications: [],
          });
        }
        if (row.medications) {
          prescriptionsMap.get(row.id).medications.push(row.medications);
        }
      });
      const groupedPrescriptions = Array.from(prescriptionsMap.values());

      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const events: any[] = [];

      if (patient.createdAt) {
        events.push({
          date: patient.createdAt,
          type: "Administrative",
          subType: "Patient créé",
          summary: "Profil patient créé",
          details: null,
        });
      }

      patientConsultations.forEach((c) => {
        let details = `Diagnostic: ${c.diagnosis}`;
        if (c.notes) {
          details += `\nNote: ${c.notes.slice(0, 50)}${c.notes.length > 50 ? "..." : ""}`;
        }
        events.push({
          date: c.date || "",
          type: "Consultation",
          summary: `Motif de consultation: ${c.reason}`,
          details: details,
        });
      });

      groupedPrescriptions.forEach((p: any) => {
        const medsList = p.medications
          .map(
            (m: any) =>
              `${m.medicineName} ${m.dosage}${m.duration ? ` – ${m.duration}` : ""}`,
          )
          .join("\n");
        events.push({
          date: p.date,
          type: "Ordonnance",
          summary: "Ordonnance",
          details: medsList || "Aucun médicament prescrit",
        });
      });

      // Filter to only include certificates and blood tests
      patientDocuments
        .filter((doc) => doc.type === "certificate" || doc.type === "blood")
        .forEach((doc) => {
          let summary = "Document";
          let details = null;

          if (doc.type === "blood") {
            summary = "Analyse de sang";
            if (doc.content?.results && Array.isArray(doc.content.results)) {
              details = doc.content.results.join(", ");
            }
          } else if (doc.type === "certificate") {
            summary = "Certificat médical";
            if (doc.content?.diagnosis) {
              details = `Diagnostic: ${doc.content.diagnosis}`;
              if (doc.content.restStartDate && doc.content.restEndDate) {
                const startDate = new Date(
                  doc.content.restStartDate,
                ).toLocaleDateString("fr-FR");
                const endDate = new Date(
                  doc.content.restEndDate,
                ).toLocaleDateString("fr-FR");
                details += `\nRepos: ${startDate} - ${endDate}`;
              }
            }
          }

          events.push({
            date: doc.createdAt || "",
            type: "Document",
            summary: summary,
            details: details,
          });
        });

      events.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      return events;
    } catch (error) {
      console.error("Failed to get timeline:", error);
      return [];
    }
  });

  ipcMain.handle("delete-prescription", async (__dirname, id) => {
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
  });

  ipcMain.handle("delete-document", async (_, id) => {
    await db.delete(Document).where(eq(Document.id, id));
  });

  ipcMain.handle("edit-consultation", async (_, data) => {
    const { id, ...rest } = data;
    if (rest.amountPaid !== undefined && rest.amountPaid !== null) {
      rest.amountPaid = Math.round(Number(rest.amountPaid));
    }
    await db.update(consultations).set(rest).where(eq(consultations.id, id));
    invalidateMonthlyPatientsCache();
  });
  ipcMain.handle(
    "addFullPrescription",
    async (
      _event,
      {
        patientId,
        medications,
        isPsychotropic,
        patientAddress: frontendAddress,
        prescriptionDate,
      },
    ) => {
      try {
        if (
          !patientId ||
          !Array.isArray(medications) ||
          medications.length === 0
        ) {
          throw new Error("Invalid prescription data");
        }

        let psychotropicNumber: number | null = null;
        let patientAddress: string | null = frontendAddress || null;

        if (isPsychotropic) {
          const [counter] = await db
            .insert(psychotropicCounters)
            .values({})
            .returning({ id: psychotropicCounters.id });

          psychotropicNumber = counter.id;

          if (!patientAddress) {
            const [patient] = await db
              .select({ address: patients.address })
              .from(patients)
              .where(eq(patients.id, patientId));

            if (!patient) {
              throw new Error("Patient not found.");
            }

            patientAddress = patient.address;
          }
        }

        const [newPrescription] = await db
          .insert(prescriptions)
          .values({
            patientId,
            prescriptionDate: prescriptionDate || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            is_psychotropic: isPsychotropic,
            psychotropic_number: psychotropicNumber,
            patient_address: patientAddress,
          })
          .returning({ id: prescriptions.id });

        if (!newPrescription) {
          throw new Error("Failed to create prescription record.");
        }

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

        return {
          success: true,
          message: "Prescription saved successfully!",
          psychotropic_number: psychotropicNumber,
        };
      } catch (error) {
        console.error("Error adding prescription:", error);
        return { success: false, message: error };
      }
    },
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
      const existing = await db.select().from(image);
      for (const row of existing) {
        const oldPath = row.imagePath;
        if (oldPath && fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
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

      fs.writeFileSync(destPath, Buffer.from(base64Data, "base64"));

      await db.insert(image).values({ imagePath: destPath });

      return { success: true, path: destPath };
    } catch (err) {
      console.error("📢 Image upload failed:", err);
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle("get-image", async () => {
    try {
      const result = await db.select().from(image).limit(1);

      if (result.length === 0) {
        return { success: false, error: "No image found" };
      }

      const imagePath = result[0].imagePath;

      if (!imagePath || !fs.existsSync(imagePath)) {
        return { success: false, error: "Image file not found on disk" };
      }

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
        accentColor,
        fontFamily,
      } = formData;

      const servicesFr = services.map((s: any) => s.fr);
      const servicesAr = services.map((s: any) => s.ar);

      const modelToSave = {
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
        accentColor,
        fontFamily,
      };

      const existing = await db.select().from(prescriptionModel).limit(1);

      if (existing.length === 0) {
        await db.insert(prescriptionModel).values(modelToSave);
      } else {
        await db
          .update(prescriptionModel)
          .set(modelToSave)
          .where(eq(prescriptionModel.id, existing[0].id));
      }
      return {
        success: true,
        model: {
          ...modelToSave,
          services,
        },
      };
    } catch (err) {
      console.error("Failed to save model", err);
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
      const [
        [consultationsThisMonth],
        [consultationsLastMonth],
        [consultationsToday],
        [prescriptionsThisMonth],
        [earningsToday],
        [earningsThisMonth],
        [earningsLastMonth],
        [expensesToday],
        [expensesThisMonth],
        [expensesLastMonth],
        [totalPatients],
        [appointmentsToday],
        recentConsultations,
        [patientsThisMonth],
        [patientsLastMonth],
        commonDiagnosesRaw,
        busiestDaysRaw,
        retentionStatsRaw,
      ] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(consultations)
          .where(
            sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
          ),
        db
          .select({ count: sql<number>`count(*)` })
          .from(consultations)
          .where(
            sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
          ),
        db
          .select({ count: sql<number>`count(*)` })
          .from(consultations)
          .where(sql`date(${consultations.date}) = date('now')`),
        db
          .select({ count: sql<number>`count(*)` })
          .from(prescriptions)
          .where(
            sql`strftime('%Y-%m', ${prescriptions.prescriptionDate}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
          ),
        db
          .select({ sum: sql<number>`sum(${consultations.amountPaid})` })
          .from(consultations)
          .where(sql`date(${consultations.date}) = date('now')`),
        db
          .select({ sum: sql<number>`sum(${consultations.amountPaid})` })
          .from(consultations)
          .where(
            sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
          ),
        db
          .select({ sum: sql<number>`sum(${consultations.amountPaid})` })
          .from(consultations)
          .where(
            sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
          ),
        db
          .select({ sum: sql<number>`sum(${expenses.amount})` })
          .from(expenses)
          .where(sql`date(${expenses.date}) = date('now')`),
        db
          .select({ sum: sql<number>`sum(${expenses.amount})` })
          .from(expenses)
          .where(
            sql`strftime('%Y-%m', ${expenses.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
          ),
        db
          .select({ sum: sql<number>`sum(${expenses.amount})` })
          .from(expenses)
          .where(
            sql`strftime('%Y-%m', ${expenses.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
          ),
        db
          .select({
            count: sql<number>`count(DISTINCT ${consultations.patientId})`,
          })
          .from(consultations)
          .where(sql`${consultations.date} >= date('now', '-12 months')`),
        db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(sql`date(${appointments.date}) = date('now')`),
        db
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
          .limit(5),
        db
          .select({
            count: sql<number>`count(DISTINCT ${consultations.patientId})`,
          })
          .from(consultations)
          .where(
            sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', CURRENT_TIMESTAMP)`,
          ),
        db
          .select({
            count: sql<number>`count(DISTINCT ${consultations.patientId})`,
          })
          .from(consultations)
          .where(
            sql`strftime('%Y-%m', ${consultations.date}) = strftime('%Y-%m', date('now', '-1 month'))`,
          ),
        db.all(
          sql`SELECT ${consultations.diagnosis} as diagnosis, COUNT(*) as count FROM ${consultations} WHERE ${consultations.diagnosis} IS NOT NULL AND ${consultations.diagnosis} != '' AND ${consultations.date} >= date('now', '-3 months') GROUP BY ${consultations.diagnosis} ORDER BY count DESC LIMIT 5`,
        ),
        db.all(
          sql`SELECT CASE CAST(strftime('%w', ${consultations.date}) AS INTEGER) WHEN 0 THEN 'Dimanche' WHEN 1 THEN 'Lundi' WHEN 2 THEN 'Mardi' WHEN 3 THEN 'Mercredi' WHEN 4 THEN 'Jeudi' WHEN 5 THEN 'Vendredi' WHEN 6 THEN 'Samedi' END as day, COUNT(*) as count FROM ${consultations} WHERE ${consultations.date} >= date('now', '-3 months') GROUP BY strftime('%w', ${consultations.date}) ORDER BY CAST(strftime('%w', ${consultations.date}) AS INTEGER)`,
        ),
        db.all(
          sql`SELECT COUNT(DISTINCT patient_id) as totalUniquePatients, COUNT(DISTINCT CASE WHEN visit_count > 1 THEN patient_id END) as totalReturnPatients FROM (SELECT patient_id, COUNT(*) as visit_count FROM ${consultations} WHERE ${consultations.date} >= date('now', '-6 months') GROUP BY patient_id)`,
        ),
      ]);

      const commonDiagnoses = commonDiagnosesRaw as {
        diagnosis: string;
        count: number;
      }[];
      const busiestDays = busiestDaysRaw as { day: string; count: number }[];
      const retentionStats = (
        retentionStatsRaw as {
          totalUniquePatients: number;
          totalReturnPatients: number;
        }[]
      )[0];

      const retentionRate =
        retentionStats.totalUniquePatients > 0
          ? (retentionStats.totalReturnPatients /
            retentionStats.totalUniquePatients) *
          100
          : 0;

      return {
        consultationsThisMonth: consultationsThisMonth.count,
        consultationsToday: consultationsToday.count,
        prescriptionsThisMonth: prescriptionsThisMonth.count,
        totalPatients: totalPatients.count,
        appointmentsToday: appointmentsToday.count,
        recentConsultations,
        consultationsLastMonth: consultationsLastMonth.count,
        patientsThisMonth: patientsThisMonth.count,
        patientsLastMonth: patientsLastMonth.count,
        earningsToday: earningsToday.sum || 0,
        earningsThisMonth: earningsThisMonth.sum || 0,
        earningsLastMonth: earningsLastMonth.sum || 0,
        expensesToday: expensesToday.sum || 0,
        expensesThisMonth: expensesThisMonth.sum || 0,
        expensesLastMonth: expensesLastMonth.sum || 0,
        commonDiagnoses,
        busiestDays,
        retentionRate: Math.round(retentionRate * 10) / 10,
        totalReturnPatients: retentionStats.totalReturnPatients,
        totalUniquePatients: retentionStats.totalUniquePatients,
      };
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      throw error;
    }
  });

  const months = [
    "Janv",
    "Févr",
    "Mars",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sept",
    "Oct",
    "Nov",
    "Déc",
  ];

  let cache: { data: any; timestamp: number } | null = null;
  const CACHE_DURATION = 5 * 60 * 1000;

  const invalidateMonthlyPatientsCache = () => {
    cache = null;
  };

  async function getMonthlyPatients() {
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_DURATION) {
      return cache.data;
    }

    const currentYear = new Date().getFullYear();

    const results = await db.all(
      sql`
  SELECT 
    strftime('%m', date) AS month,
    COUNT(DISTINCT patient_id) AS total
  FROM ${consultations}
  WHERE strftime('%Y', date) = ${String(currentYear)}
  GROUP BY month
  `,
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

  ipcMain.handle("add-appointment", async (_, data) => {
    try {
      await db.insert(appointments).values(data);
      return { success: true };
    } catch (error) {
      console.error("Failed to add appointment:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-appointments", async (_, patientId) => {
    try {
      const result = await db
        .select()
        .from(appointments)
        .where(eq(appointments.patientId, patientId))
        .orderBy(desc(appointments.date));
      return result;
    } catch (error) {
      console.error("Failed to get appointments:", error);
      return [];
    }
  });

  ipcMain.handle("get-all-appointments", async () => {
    try {
      const result = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          title: appointments.title,
          notes: appointments.notes,
          status: appointments.status,
          patientId: appointments.patientId,
          patientFirstName: patients.first_name,
          patientLastName: patients.last_name,
        })
        .from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .orderBy(desc(appointments.date));
      return result;
    } catch (error) {
      console.error("Failed to get all appointments:", error);
      return [];
    }
  });

  ipcMain.handle("delete-appointment", async (_, id) => {
    try {
      await db.delete(appointments).where(eq(appointments.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("check-password", async (_, inputPassword) => {
    const result = await db.select().from(auth).limit(1);
    const storedHash = result[0]?.passwordHash;

    if (!storedHash) {
      return false;
    }

    const isUserPasswordCorrect = await bcrypt.compare(
      inputPassword,
      storedHash,
    );

    return Boolean(isUserPasswordCorrect);
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
    const result = await db.select().from(auth).limit(1);
    const storedHash = result[0]?.passwordHash;

    if (!storedHash) {
      throw new Error("No password set");
    }

    const isCorrect = await bcrypt.compare(oldPassword, storedHash);

    if (!isCorrect) {
      return { success: false, message: "Incorrect old password" };
    }
    const newHashed = await bcrypt.hash(newPassword, 10);
    await db
      .update(auth)
      .set({ passwordHash: newHashed })
      .where(eq(auth.id, result[0].id));

    return { success: true };
  });

  ipcMain.handle("remove-password", async (_, password) => {
    const result = await db.select().from(auth).limit(1);
    const storedHash = result[0]?.passwordHash;

    if (!storedHash) {
      return { success: false, message: "Aucun mot de passe défini" };
    }

    const isCorrect = await bcrypt.compare(password, storedHash);

    if (!isCorrect) {
      return { success: false, message: "Mot de passe incorrect" };
    }

    await db.delete(auth);
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
  ipcMain.handle("create-document", async (_, data) => {
    try {
      const { patientId, type, content, name, documentDate } = data;
      const [newDoc] = await db
        .insert(Document)
        .values({
          patientId,
          type,
          content,
          name,
          documentDate: documentDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
        .returning({ id: Document.id });
      return { success: true, id: newDoc.id };
    } catch (error) {
      console.error("Error creating document:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-patient-documents", async (_, patientId) => {
    try {
      const result = await db
        .select()
        .from(Document)
        .where(eq(Document.patientId, patientId))
        .orderBy(desc(Document.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  });

  async function getNextPsychotropicNumber() {
    try {
      const result = await db
        .select({
          id: psychotropicCounters.id,
        })
        .from(psychotropicCounters)
        .orderBy(desc(psychotropicCounters.id))
        .limit(1);

      const latestNumber = result[0]?.id || 0;
      return latestNumber + 1;
    } catch (error) {
      console.error("Error fetching next psychotropic number:", error);
      throw new Error("Failed to fetch next psychotropic number.");
    }
  }
  ipcMain.handle("get-next-psychotropic-number", async () => {
    return await getNextPsychotropicNumber();
  });

  function registerBackupIpc() {
    ipcMain.handle("db:backup", async () => {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Backup database",
        defaultPath: `backup-${Date.now()}.db`,
        filters: [{ name: "Database", extensions: ["db"] }],
      });

      if (canceled || !filePath) return false;

      await backupDatabase(filePath);
      return true;
    });

    ipcMain.handle("db:restore", async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Restore database",
        filters: [{ name: "Database", extensions: ["db"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) return false;

      await restoreDatabase(filePaths[0]);
      return true;
    });
  }

  function getMachineId(original = false): string {
    try {
      const id = machineIdSync(original); // original = true gives full hardware ID
      return id;
    } catch (err) {
      console.error("Failed to get machine ID:", err);
      return "UNKNOWN";
    }
  }
  ipcMain.handle("get-machine-id", async () => {
    return getMachineId();
  });

  ipcMain.handle("validate-license", async (_, key, payload) => {
    const isValid = validateLicenseKey(key, payload);
    if (isValid) saveLicense(key, payload);
    return isValid;
  });

  ipcMain.handle("get-license", async () => {
    return getLicense();
  });

  ipcMain.handle("get-app-init-data", async () => {
    const license = getLicense();
    let isLicensed = false;

    if (license && license.key && license.payload) {
      // Re-validate stored license against current machine
      isLicensed = validateLicenseKey(license.key, license.payload as any);
    }

    const result = await db.select().from(auth).limit(1);
    const passwordExists = result.length > 0 && Boolean(result[0].passwordHash);

    return {
      isLicensed,
      passwordExists,
      machineId: getMachineId(),
    };
  });
  ipcMain.handle("reset-license", async () => {
    resetLicense();
  });

  ipcMain.handle("get-custom-fields", async () => {
    try {
      return await db
        .select()
        .from(customFields)
        .where(eq(customFields.isActive, true));
    } catch (error) {
      console.error("Failed to fetch custom fields:", error);
      return [];
    }
  });

  ipcMain.handle("add-custom-field", async (_, data) => {
    try {
      await db.insert(customFields).values(data);
      return { success: true };
    } catch (error) {
      console.error("Failed to add custom field:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("delete-custom-field", async (_, id) => {
    try {
      await db
        .update(customFields)
        .set({ isActive: false })
        .where(eq(customFields.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete custom field:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-expenses", async () => {
    try {
      return await db.select().from(expenses).orderBy(desc(expenses.date));
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      return [];
    }
  });

  ipcMain.handle("add-expense", async (_, data) => {
    try {
      await db.insert(expenses).values({
        ...data,
        date: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to add expense:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("delete-expense", async (_, id) => {
    try {
      await db.delete(expenses).where(eq(expenses.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete expense:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-prescription-templates", async () => {
    try {
      const templates = await db.select().from(prescriptionTemplates);
      const fullTemplates = await Promise.all(
        templates.map(async (template) => {
          const meds = await db
            .select()
            .from(prescriptionTemplateMedications)
            .where(eq(prescriptionTemplateMedications.templateId, template.id));
          return { ...template, medications: meds };
        }),
      );
      return fullTemplates;
    } catch (error) {
      console.error("Failed to fetch prescription templates:", error);
      return [];
    }
  });

  ipcMain.handle(
    "add-prescription-template",
    async (_, { name, medications }) => {
      try {
        const [newTemplate] = await db
          .insert(prescriptionTemplates)
          .values({ name })
          .returning({ id: prescriptionTemplates.id });

        if (medications && medications.length > 0) {
          const medsToInsert = medications.map((med: any) => ({
            ...med,
            templateId: newTemplate.id,
          }));
          await db.insert(prescriptionTemplateMedications).values(medsToInsert);
        }
        return { success: true };
      } catch (error) {
        console.error("Failed to add prescription template:", error);
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle("delete-prescription-template", async (_, id) => {
    try {
      await db
        .delete(prescriptionTemplates)
        .where(eq(prescriptionTemplates.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete prescription template:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-document-templates", async () => {
    try {
      return await db
        .select()
        .from(documentTemplates)
        .orderBy(desc(documentTemplates.isDefault));
    } catch (error) {
      console.error("Failed to fetch document templates:", error);
      return [];
    }
  });

  ipcMain.handle("add-document-template", async (_, data) => {
    try {
      await db.insert(documentTemplates).values({
        ...data,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to add document template:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("update-document-template", async (_, { id, ...data }) => {
    try {
      await db
        .update(documentTemplates)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(documentTemplates.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to update document template:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("delete-document-template", async (_, id) => {
    try {
      // Don't delete defaults
      const [template] = await db
        .select()
        .from(documentTemplates)
        .where(eq(documentTemplates.id, id));
      if (template?.isDefault) {
        return { success: false, error: "Cannot delete default templates" };
      }
      await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete document template:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-patient-vitals", async (_, patientId) => {
    try {
      const result = await db
        .select({
          date: consultations.date,
          bloodPressure: consultations.bloodPressure,
          glucose: consultations.glucose,
          weight: consultations.weight,
        })
        .from(consultations)
        .where(eq(consultations.patientId, patientId))
        .orderBy(consultations.date);

      return result;
    } catch (error) {
      console.error("Error fetching patient vitals:", error);
      return [];
    }
  });

  ipcMain.handle("global-search", async (_, query: string) => {
    if (!query || query.length < 2) return [];

    try {
      const patientResults = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          lastName: patients.last_name,
        })
        .from(patients)
        .where(
          or(
            like(patients.first_name, `%${query}%`),
            like(patients.last_name, `%${query}%`),
            like(patients.contact, `%${query}%`),
          ),
        )
        .limit(5);

      const consultationResults = await db
        .select({
          id: consultations.id,
          patientId: consultations.patientId,
          reason: consultations.reason,
          diagnosis: consultations.diagnosis,
          date: consultations.date,
          patientFirstName: patients.first_name,
          patientLastName: patients.last_name,
        })
        .from(consultations)
        .leftJoin(patients, eq(consultations.patientId, patients.id))
        .where(
          or(
            like(consultations.reason, `%${query}%`),
            like(consultations.diagnosis, `%${query}%`),
          ),
        )
        .limit(5);

      const results = [
        ...patientResults.map((p) => ({
          type: "patient",
          id: p.id,
          title: `${p.firstName} ${p.lastName}`,
          subtitle: "Patient",
        })),
        ...consultationResults.map((c) => ({
          type: "consultation",
          id: c.id,
          patientId: c.patientId,
          title: `${c.patientFirstName} ${c.patientLastName} - ${c.reason || c.diagnosis}`,
          subtitle: `Consultation (${new Date(c.date!).toLocaleDateString("fr-FR")})`,
        })),
      ];

      return results;
    } catch (error) {
      console.error("Global search failed:", error);
      return [];
    }
  });

  registerBackupIpc();

  win.webContents.setWindowOpenHandler(() => ({ action: "allow" }));
});
