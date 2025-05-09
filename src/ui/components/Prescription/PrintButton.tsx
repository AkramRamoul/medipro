import { pdf } from "@react-pdf/renderer";
import PrescriptionPDF from "../Patient/Pdf"; // Your PDF component
import { useEffect, useState } from "react";
import { smallPatient } from "../../type";
import { Printer } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { PrescriptionMed } from "../../../electron/schema";
import { toast } from "sonner";

const PrintButton = ({
  patient,
  window,
  prescription,
}: {
  patient: smallPatient;
  window: Window;
  prescription: PrescriptionMed[];
}) => {
  const [prescriptionModel, setPrescriptionModel] = useState(null);
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    const getImage = async () => {
      const result = await window.electronAPI.getImage();
      if (result.success) {
        setImage(result.image);
      } else {
        console.error("Error fetching image:", result.error);
      }
    };
    getImage();
  }, [window.electronAPI]);

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
      toast.error("Prescription model not loaded yet.");
      return;
    }

    // Generate PDF as blob
    const blob = await pdf(
      <PrescriptionPDF
        patient={patient}
        prescriptionModel={prescriptionModel}
        image={image}
        medications={prescription}
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
      toast.error("Popup blocked! Please allow popups for this site.");
    }
  };

  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
    >
      <Printer className="mr-2 h-4 w-4" onClick={(e) => e.stopPropagation()} />
      Print
    </DropdownMenuItem>
  );
};

export default PrintButton;
