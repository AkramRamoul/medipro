import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import PatientRecordPdf from "../components/Patients/PatientRecordPdf";

export function usePatientPdfExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = async (patientId: string) => {
        setIsExporting(true);
        try {
            // Wait for DB to settle (fix for stale data on immediate export)
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Fetch all required data in parallel
            const [patientArray, consultations, prescriptions, timeline, documents] = await Promise.all([
                window.electronAPI.getpatient(patientId),
                window.electronAPI.getConsultations(patientId),
                window.electronAPI.getPatientPrescriptions(patientId),
                window.electronAPI.getPatientTimeline(patientId),
                window.electronAPI.getPatientDocuments(patientId)
            ]);

            const patient = (patientArray as any)[0];

            if (!patient) {
                throw new Error("Patient not found");
            }

            const blob = await pdf(
                <PatientRecordPdf
                    patient={patient}
                    consultations={consultations}
                    prescriptions={prescriptions}
                    timeline={timeline}
                    documents={documents}
                />
            ).toBlob();


            const buffer = await blob.arrayBuffer();
            const filename = `Dossier_${patient.first_name}_${patient.last_name}.pdf`;

            const result = await window.electronAPI.savePdf(buffer, filename);

            if (result.success) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to export PDF:", error);
            return false;
        } finally {
            setIsExporting(false);
        }
    };

    return { exportPdf, isExporting };
}
