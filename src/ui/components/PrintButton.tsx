import { pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { PrescriptionMed } from "../../electron/schema";
import { smallPatient } from "../type";
import PrescriptionPDF from "./Patient/Pdf";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Printer } from "lucide-react";

const PrintButton = ({
  patient,
  window,
  prescription,
  isPsychotropic,
  psychotropicNumber,
  patientAddress,
  disabled,
}: {
  patient: smallPatient;
  window: Window;
  prescription: PrescriptionMed[];
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
  disabled?: boolean;
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
    if (disabled) {
      toast.error("Veuillez ajouter au moins un médicament !");
      return;
    }
    if (!prescriptionModel) {
      toast("Le modèle de prescription n'est pas encore chargé.");
      return;
    }

    // Generate PDF as blob
    const blob = await pdf(
      <PrescriptionPDF
        patient={patient}
        prescriptionModel={prescriptionModel}
        image={image}
        medications={prescription}
        isPsychotropic={isPsychotropic}
        psychotropicNumber={psychotropicNumber}
        patientAddress={patientAddress}
      />
    ).toBlob();

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send to main
    await window.electronAPI.printPdf(buffer);

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
      toast.error("Popup bloqué ! Veuillez autoriser les popups.");
    }
  };

  return (
    <Button
      size="lg"
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
      className="  bg-primary px-4 py-2 text-white"
    >
      <Printer className="w-4 h-4" />
      Imprimer
    </Button>
  );
};

export default PrintButton;
