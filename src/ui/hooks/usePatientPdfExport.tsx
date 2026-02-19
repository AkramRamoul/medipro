import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import PatientRecordPdf from "../components/Patients/PatientRecordPdf";
import api from "../axios";

export function usePatientPdfExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = async (patientId: string) => {
        setIsExporting(true);
        try {
            // Fetch all required data in parallel using the backend API
            const [
                { data: patient },
                { data: consultations },
                { data: prescriptions },
                { data: timeline },
                { data: documents }
            ] = await Promise.all([
                api.get(`/patients/${patientId}`),
                api.get(`/consultations/patient/${patientId}`),
                api.get(`/prescriptions/patient/${patientId}`),
                api.get(`/patients/${patientId}/timeline`),
                api.get(`/documents/patient/${patientId}`)
            ]);

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

            // Create a temporary link to download the PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Dossier_${patient.first_name}_${patient.last_name}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (error) {
            console.error("Failed to export PDF:", error);
            return false;
        } finally {
            setIsExporting(false);
        }
    };

    return { exportPdf, isExporting };
}
