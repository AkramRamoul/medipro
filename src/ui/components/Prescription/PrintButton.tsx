import { pdf } from "@react-pdf/renderer";
import PrescriptionPDF from "../Patient/Pdf"; // Your PDF component
import { useEffect, useState } from "react";
import { Patient } from "../../type";

const PrintButton = ({
  patient,
  window,
}: {
  patient: Patient;
  window: Window;
}) => {
  const [prescriptionModel, setPrescriptionModel] = useState(null);

  // Fetch prescription model on mount
  useEffect(() => {
    const fetchModel = async () => {
      const data = await window.electronAPI.getPrescriptionModel();
      if (data.success) {
        setPrescriptionModel(data.model);
      } else {
        console.error("❌ Failed to fetch model:", data.error);
      }
    };
    fetchModel();
  }, [window.electronAPI]);

  const handlePrint = async () => {
    if (!prescriptionModel) {
      alert("Prescription model not loaded yet.");
      return;
    }

    // Generate PDF as blob
    const blob = await pdf(
      <PrescriptionPDF
        patient={patient}
        prescriptionModel={prescriptionModel}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);

    // Open in new tab and print
    const newTab = window.open(url);

    if (newTab) {
      newTab.onload = () => {
        newTab.print();
        // Cannot use `webContents` in browser context
        newTab.onafterprint = () => {
          newTab.close();
        };
      };
    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Print Prescription
    </button>
  );
};

export default PrintButton;
