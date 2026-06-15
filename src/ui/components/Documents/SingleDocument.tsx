import { useState } from "react";
import { toast } from "sonner";
import api from "../../axios";
import { Document, smallPatient } from "../../type";
import { calculateAge } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  X,
  FileText,
  FlaskConical,
  Activity,
  Calendar,
  FileCheck,
  Pill,
  Stethoscope,
  Printer,
  Loader2,
} from "lucide-react";

interface SingleDocumentProps {
  document: Document;
  patient?: smallPatient;
  onClose?: () => void;
}

const labels: Record<Document["type"], string> = {
  blood: "Demande Bilan",
  certificate: "Certificat Médical",
  report: "Rapport Médical",
  template: "Lettre / Certificat (Modèle)",
};

const icons: Record<Document["type"], any> = {
  blood: FlaskConical,
  certificate: FileCheck,
  report: FileText,
  template: FileText,
};

export function SingleDocument({ document, patient, onClose }: SingleDocumentProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const Icon = icons[document.type] || FileText;

  const handlePrint = async () => {
    if (!patient) {
      toast.error("Données du patient manquantes pour l'impression.");
      return;
    }

    setIsPrinting(true);
    try {
      // Fetch settings
      const [logoRes, modelRes] = await Promise.all([
        api.get("/settings/logo"),
        api.get("/settings/prescription-model")
      ]);

      if (!modelRes.data.success) {
        throw new Error("Impossible de charger le modèle d'impression.");
      }

      const prescriptionModel = modelRes.data.model;
      const image = logoRes.data.success ? logoRes.data.image : null;

      // Dynamic imports for printing
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: DocumentPrintable } = await import("./DocumentPrintable");
      const { printHtml } = await import("../../lib/print-utils");

      const htmlContent = renderToStaticMarkup(
        <DocumentPrintable
          first_name={patient.first_name}
          last_name={patient.last_name}
          patientAge={calculateAge(patient.dateOfBirth) ?? 0}
          prescriptionModel={prescriptionModel}
          image={image}
          documentContent={document.content}
          documentType={document.type}
          documentName={document.name}
          documentDate={document.documentDate}
        />
      );

      const fullHtml = `<!DOCTYPE html>${htmlContent}`;
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

  const renderContent = () => {
    const { content } = document;

    switch (document.type) {
      case "blood": {
        const bloodContent = content as { results: string[]; date?: string; patientName?: string };
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 group transition-all hover:bg-primary/10">
                <div className="p-3 rounded-xl bg-background shadow-sm text-primary transition-transform group-hover:scale-110 border border-border/50">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date de demande</p>
                  <p className="text-sm font-semibold text-foreground">
                    {bloodContent.date
                      ? new Date(bloodContent.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {bloodContent.patientName && (
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 dark:bg-blue-400/10 dark:border-blue-400/20 flex items-center gap-4 group transition-all hover:bg-blue-500/10">
                  <div className="p-3 rounded-xl bg-background shadow-sm text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 border border-border/50">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">Patient</p>
                    <p className="text-sm font-semibold text-foreground">{bloodContent.patientName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Analyses demandées
                </h4>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {bloodContent.results?.length || 0} Examen(s)
                </Badge>
              </div>

              {bloodContent.results && bloodContent.results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bloodContent.results.map((result, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{result}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">
                  <FlaskConical className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm italic">Aucune analyse spécifiée.</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case "certificate": {
        const certContent = content as {
          diagnosis: string;
          restStartDate: string;
          restEndDate: string;
          remarks?: string;
          examinationDate?: string;
        };
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Date d'examen:{" "}
                {certContent.examinationDate
                  ? new Date(certContent.examinationDate).toLocaleDateString(
                    "fr-FR",
                  )
                  : "N/A"}
              </span>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 dark:bg-blue-400/10 dark:border-blue-400/20 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Diagnostic
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">{certContent.diagnosis}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg border">
                <span className="text-xs text-muted-foreground block mb-1">
                  Du
                </span>
                <span className="font-medium">
                  {certContent.restStartDate
                    ? new Date(certContent.restStartDate).toLocaleDateString(
                      "fr-FR",
                    )
                    : "N/A"}
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border">
                <span className="text-xs text-muted-foreground block mb-1">
                  Au
                </span>
                <span className="font-medium">
                  {certContent.restEndDate
                    ? new Date(certContent.restEndDate).toLocaleDateString(
                      "fr-FR",
                    )
                    : "N/A"}
                </span>
              </div>
            </div>

            {certContent.remarks && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Remarques</h4>
                <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-md border">
                  {certContent.remarks}
                </p>
              </div>
            )}
          </div>
        );
      }

      case "report": {
        const reportContent = content as {
          examenClinique: string;
          diagnostic: string;
          traitement: string;
          date?: string;
        };

        return (
          <div className="space-y-6">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Date :{" "}
                {reportContent.date
                  ? new Date(reportContent.date).toLocaleDateString("fr-FR")
                  : "N/A"}
              </span>
            </div>

            {/* Examen Clinique */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-primary">
                <Stethoscope className="w-4 h-4" />
                Examen clinique
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {reportContent.examenClinique}
              </p>
            </div>

            {/* Diagnostic */}
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-400/10 dark:border-blue-400/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Activity className="w-4 h-4" />
                Diagnostic
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">
                {reportContent.diagnostic}
              </p>
            </div>

            {/* Traitement */}
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 dark:bg-green-400/10 dark:border-green-400/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                <Pill className="w-4 h-4" />
                Traitement
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {reportContent.traitement}
              </p>
            </div>
          </div>
        );
      }

      case "template": {
        return (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        );
      }

      default:
        return <p>Type de document non reconnu.</p>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none h-full flex flex-col">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-primary">
                {document.name || labels[document.type]}
              </CardTitle>
              <CardDescription>
                Crée le{" "}
                {document.createdAt
                  ? new Date(document.createdAt).toLocaleDateString("fr-FR")
                  : "Date inconnue"}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs uppercase">
            {(document.name || labels[document.type]).split(" ")[0]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1 overflow-y-auto max-h-[80vh]">
        {renderContent()}
      </CardContent>


      <CardFooter className="pt-6 border-t mt-auto flex justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            {" "}
            {document.type === "blood" ? "Imprimer le bilan" : "Imprimer le document"}
          </Button>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="secondary" className="gap-2 px-6">
            <X className="w-4 h-4" /> Fermer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
