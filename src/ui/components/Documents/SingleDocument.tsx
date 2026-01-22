import { Document } from "../../type";
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
import { Separator } from "../ui/separator";
import {
  X,
  FileText,
  FlaskConical,
  Activity,
  Calendar,
  FileCheck,
  Pill,
  Stethoscope,
} from "lucide-react";

interface SingleDocumentProps {
  document: Document;
  onClose?: () => void;
}

const labels = {
  blood: "Demande Bilan",
  certificate: "Certificat Médical",
  report: "Rapport Médical",
} as const;

const icons = {
  blood: FlaskConical,
  certificate: FileCheck,
  report: FileText,
};

export function SingleDocument({ document, onClose }: SingleDocumentProps) {
  const Icon = icons[document.type] || FileText;

  const renderContent = () => {
    const { content } = document;

    switch (document.type) {
      case "blood": {
        const bloodContent = content as { results: string[]; date?: string };
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Date:{" "}
                {bloodContent.date
                  ? new Date(bloodContent.date).toLocaleDateString("fr-FR")
                  : "N/A"}
              </span>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Analyses demandées
              </h4>
              {bloodContent.results && bloodContent.results.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bloodContent.results.map((result, idx) => (
                    <li
                      key={idx}
                      className="bg-muted/30 p-2 rounded-md border text-sm flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {result}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aucune analyse spécifiée.
                </p>
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

            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Diagnostic
              </h4>
              <p className="text-sm leading-relaxed">{certContent.diagnosis}</p>
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
            <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Activity className="w-4 h-4" />
                Diagnostic
              </h4>
              <p className="text-sm leading-relaxed">
                {reportContent.diagnostic}
              </p>
            </div>

            {/* Traitement */}
            <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20 dark:border-green-900/50">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <Pill className="w-4 h-4" />
                Traitement
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {reportContent.traitement}
              </p>
            </div>
          </div>
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
                {labels[document.type]}
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
            {labels[document.type].split(" ")[0]}
          </Badge>
        </div>
      </CardHeader>

      <div className="flex-1 max-h-[60vh]">
        <CardContent className="pt-6">{renderContent()}</CardContent>
      </div>

      {onClose && (
        <CardFooter className="pt-4 mt-auto justify-end">
          <Button onClick={onClose} variant="outline" className="gap-2">
            <X className="w-4 h-4" /> Fermer
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
