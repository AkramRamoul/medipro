import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Printer } from "lucide-react";
import EmptyPrescriptionPDF from "./EmptyPrescriptionPDF";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrintButton = ({ model, image }: any) => {
  const handlePrint = async () => {
    if (!model) {
      toast.error("Le modèle de prescription n'est pas prêt.");
      return;
    }

    const blob = await pdf(
      <EmptyPrescriptionPDF prescriptionModel={model} image={image} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const win = window.open(url);

    if (!win) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression.");
      return;
    }

    win.onload = () => {
      win.print();
      win.onafterprint = () => win.close();
    };
  };

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-full shadow-xl"
    >
      <Printer className="w-5 h-5" />
      <span className="hidden sm:inline">Imprimer</span>
    </Button>
  );
};

export default PrintButton;
