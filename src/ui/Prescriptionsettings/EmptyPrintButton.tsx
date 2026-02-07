import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Printer } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrintButton = ({ model, image }: any) => {
  const handlePrint = async () => {
    if (!model) {
      toast.error("Le modèle de prescription n'est pas prêt.");
      return;
    }

    try {
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: EmptyPrescriptionPrintable } = await import("../components/EmptyPrescriptionPrintable");

      const htmlContent = renderToStaticMarkup(
        <EmptyPrescriptionPrintable prescriptionModel={model} image={image} />
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
