import { useEffect, useState } from "react";
import { smallPatient } from "../../type";
import { Printer } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { PrescriptionMed } from "../../../electron/schema";
import { toast } from "sonner";
import api from "../../axios";

const PrintButton = ({
  patient,
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
      try {
        const { data } = await api.get("/settings/logo");
        if (data.success) {
          setImage(data.image);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };
    getImage();
  }, []);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const { data } = await api.get("/settings/prescription-model");
        if (data.success) {
          setPrescriptionModel(data.model);
        }
      } catch (error) {
        console.error("❌ Failed to fetch model:", error);
      }
    };
    fetchModel();
  }, []);

  const handlePrint = async () => {
    if (!prescriptionModel) {
      toast("Le modèle de prescription n'est pas encore chargé.");
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
      const { printHtml } = await import("../../lib/print-utils");
      const result = await printHtml(fullHtml);

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
