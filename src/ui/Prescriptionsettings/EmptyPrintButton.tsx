import { pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Printer } from "lucide-react";
import EmptyPrescriptionPDF from "./EmptyPrescriptionPDF";

const PrintButton = ({ window }: { window: Window }) => {
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
      toast.error("Le modèle de prescription n'est pas encore chargé.");
      return;
    }

    // Generate PDF as blob
    const blob = await pdf(
      <EmptyPrescriptionPDF
        prescriptionModel={prescriptionModel}
        image={image}
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
      toast.error("Erreur lors de l'ouverture d'un nouvel onglet.");
    }
  };

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-5 rounded-full shadow-xl transition-all duration-200"
    >
      <Printer className="w-5 h-5" />
      <span className="hidden sm:inline">Imprimer</span>
    </Button>
  );
};

export default PrintButton;
