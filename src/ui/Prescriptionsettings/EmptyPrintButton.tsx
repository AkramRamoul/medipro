import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Printer, Loader2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrintButton = ({ model, image }: any) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!model) {
      toast.error("Le modèle de prescription n'est pas prêt.");
      return;
    }
    setIsPrinting(true);
    try {
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: EmptyPrescriptionPrintable } =
        await import("../components/EmptyPrescriptionPrintable");

      const htmlContent = renderToStaticMarkup(
        <EmptyPrescriptionPrintable prescriptionModel={model} image={image} />,
      );

      const fullHtml = `<!DOCTYPE html>${htmlContent}`;
      const { printHtml } = await import("../lib/print-utils");
      const result = await printHtml(fullHtml);

      if (result.success) {
        toast.success("Impression lancée !");
      } else {
        toast.error(`Erreur d'impression: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to print:", error);
      toast.error("Erreur lors de l'impression");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
      disabled={isPrinting}
      className="gap-2 w-full"
    >
      {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
      {isPrinting ? "Impression en cours..." : "Imprimer modèle vierge"}
    </Button>
  );
};

export default PrintButton;

