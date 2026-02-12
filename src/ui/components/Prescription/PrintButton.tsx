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
  isPsychotropic,
  psychotropicNumber,
  patientAddress,
  prescriptionDate,
}: {
  patient: smallPatient;
  window: Window;
  prescription: PrescriptionMed[];
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
  prescriptionDate?: string | null;
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
    if (!prescriptionModel) {
      toast.error("Le modèle de prescription n'est pas encore chargé.");
      return;
    }

    try {
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: PrescriptionPrintable } = await import("../PrescriptionPrintable");

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
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
    >
      <Printer className="mr-2 h-4 w-4" onClick={(e) => e.stopPropagation()} />
      Imprimer
    </DropdownMenuItem>
  );
};

export default PrintButton;
