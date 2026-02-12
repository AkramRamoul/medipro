import { useEffect, useState } from "react";
import { PrescriptionMed } from "../../electron/schema";
import { smallPatient } from "../type";
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
  prescriptionDate,
  disabled,
}: {
  patient: smallPatient;
  window: Window;
  prescription: PrescriptionMed[];
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
  prescriptionDate?: string | null;
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

    try {
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: PrescriptionPrintable } = await import("./PrescriptionPrintable");

      const htmlContent = renderToStaticMarkup(
        <PrescriptionPrintable
          patient={patient}
          prescriptionModel={prescriptionModel}
          image={image}
          medications={prescription}
          isPsychotropic={isPsychotropic}
          psychotropicNumber={psychotropicNumber}
          patientAddress={patientAddress}
          prescriptionDate={prescriptionDate}
        />
      );

      const fullHtml = `<!DOCTYPE html>${htmlContent}`;
      const result = await window.electronAPI.printHtml(fullHtml);

      if (result.success) {
        toast.success("Impression lancée !");
      } else {
        toast.error(`Erreur d'impression: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to print:", error);
      toast.error("Erreur lors de l'impression");
    }
  };

  return (
    <Button
      size="lg"
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
      className="bg-primary px-4 py-2"
    >
      <Printer className="w-4 h-4" />
      Imprimer
    </Button>
  );
};

export default PrintButton;
