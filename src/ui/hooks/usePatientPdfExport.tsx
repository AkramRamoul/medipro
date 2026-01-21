import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import PatientRecordPdf from "../components/Patients/PatientRecordPdf";

export function usePatientPdfExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = async (patientId: string) => {
        setIsExporting(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const patientArray: any = await window.electronAPI.getpatient(patientId);
            const patient = patientArray[0];

            if (!patient) {
                throw new Error("Patient not found");
            }

            const consultations =
                await window.electronAPI.getConsultations(patientId);
            const prescriptions =
                await window.electronAPI.getPatientPrescriptions(patientId);
            const timeline = await window.electronAPI.getPatientTimeline(patientId);

            const blob = await pdf(
                <PatientRecordPdf
          patient={ patient }
          consultations = { consultations }
          prescriptions = { prescriptions }
          timeline = { timeline }
                />,
            ).toBlob();

            const buffer = await blob.arrayBuffer();
            const filename = `Dossier_${patient.first_name}_${patient.last_name}.pdf`;

            const result = await window.electronAPI.savePdf(buffer, filename);

            if (result.success) {
                console.log("PDF saved to:", result.filePath);
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
