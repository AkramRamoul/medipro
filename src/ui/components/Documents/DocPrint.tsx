import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Document, smallPatient } from "../../type";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Printer } from "lucide-react";
import api from "../../axios";
import { calculateAge } from "../../lib/ageUtils";

const DocPrint = ({
  patient,
  disabled,
  document,
}: {
  patient: smallPatient;
  disabled?: boolean;
  document: Document;
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
      const { default: DocumentPrintable } = await import("./DocumentPrintable");

      const htmlContent = renderToStaticMarkup(
        <DocumentPrintable
          first_name={patient.first_name}
          last_name={patient.last_name}
          patientAge={calculateAge(patient.dateOfBirth) ?? patient.age ?? 0}
          prescriptionModel={prescriptionModel}
          image={image}
          documentContent={document.content}
          documentType={document.type}
          documentName={document.name}
          documentDate={document.documentDate}
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

export default DocPrint;
