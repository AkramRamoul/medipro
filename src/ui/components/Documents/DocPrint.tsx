import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Document, smallPatient } from "../../type";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Printer } from "lucide-react";

const DocPrint = ({
  patient,
  window,
  disabled,
  document,
}: {
  patient: smallPatient;
  window: Window;
  disabled?: boolean;
  document: Document;
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
      const { default: DocumentPrintable } = await import("./DocumentPrintable");

      const htmlContent = renderToStaticMarkup(
        <DocumentPrintable
          first_name={patient.first_name}
          last_name={patient.last_name}
          patientAge={patient.age}
          prescriptionModel={prescriptionModel}
          image={image}
          documentContent={document.content}
          documentType={document.type}
          documentName={document.name}
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

export default DocPrint;
