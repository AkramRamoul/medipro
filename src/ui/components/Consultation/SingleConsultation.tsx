import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import {
  Loader2,
  CalendarDays,
  ClipboardCheck,
  Stethoscope,
  Activity,
  Droplet,
  Weight,
  FileText,
  Save,
  HeartPulse,
  Banknote,
  Printer,
  Pill,
} from "lucide-react";
import { Consultation } from "../../type";
import { toast } from "sonner";
import api from "../../axios";
import PrintButton from "../PrintButton";

export default function SingleConsultation({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [consultation, setConsultation] = useState<any | null>(null);
  const [linkedRecords, setLinkedRecords] = useState<{ prescriptions: any[], documents: any[] }>({ prescriptions: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [isPrintingBilan, setIsPrintingBilan] = useState(false);

  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const { data: consultationData } = await api.get(`/consultations/${id}`);
          setConsultation(consultationData);
          if (consultationData) {
            setReason(consultationData.reason || "");
            setSymptoms(consultationData.symptoms || "");
            setDiagnosis(consultationData.diagnosis || "");
            setNotes(consultationData.notes || "");
            setGlucose(consultationData.glucose || "");
            setWeight(consultationData.weight || "");
            setAmountPaid(consultationData.amountPaid?.toString() || "");
            const bp = consultationData.bloodPressure;

            if (bp && bp.includes("/")) {
              const [sys, dia] = bp.split("/");
              setBpSystolic(sys);
              setBpDiastolic(dia);
            } else {
              setBpSystolic("");
              setBpDiastolic("");
            }
          }

          try {
            const { data: recordsData } = await api.get(`/consultations/${id}/linked-records`);
            setLinkedRecords(recordsData);
          } catch (e) {
            console.error("Error fetching linked records", e);
          }
        } catch (error) {
          console.error("Error fetching consultation data:", error);
          toast.error("Erreur lors du chargement des données.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [id]);

  const handleSave = async () => {
    if (consultation) {
      const updatedConsultation = {
        ...consultation,
        reason,
        symptoms,
        diagnosis,
        bloodPressure:
          bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : null,
        glucose,
        weight,
        notes,
        amountPaid: amountPaid ? Math.round(Number(amountPaid)) : null,
      };

      try {
        await api.put(`/consultations/${consultation.id}`, updatedConsultation);
        toast.success("Consultation mise à jour avec succès !");
        onClose();
      } catch (error) {
        console.error("Error saving consultation:", error);
        toast.error("Erreur lors de la mise à jour.");
      }
    }
  };

  const handlePrintBilan = async (documentData: any) => {
    setIsPrintingBilan(true);
    try {
      const [logoRes, modelRes] = await Promise.all([
        api.get('/settings/logo'),
        api.get('/settings/prescription-model'),
      ]);

      if (!modelRes.data.success) throw new Error("Modèle introuvable");

      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: DocumentPrintable } = await import("../Documents/DocumentPrintable");
      const { printHtml } = await import("../../lib/print-utils");

      const html = renderToStaticMarkup(
        <DocumentPrintable
          first_name={consultation?.patient?.first_name || ""}
          last_name={consultation?.patient?.last_name || ""}
          patientAge={consultation?.patient?.age || 0}
          prescriptionModel={modelRes.data.model}
          image={logoRes.data.success ? logoRes.data.image : null}
          documentContent={documentData.content}
          documentType="blood"
          documentDate={documentData.documentDate || documentData.createdAt}
        />
      );

      const result = await printHtml(`<!DOCTYPE html>${html}`);
      if (result.success) toast.success("Impression lancée !");
      else toast.error(`Erreur : ${result.error}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'impression du bilan");
    } finally {
      setIsPrintingBilan(false);
    }
  };

  if (loading || !consultation) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-full mx-auto border-none shadow-none overflow-hidden flex flex-col h-[85vh]">
      <CardHeader className="flex-none border-b pb-4 shrink-0">
        <CardTitle className="text-2xl flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Consultation du{" "}
          {consultation?.date
            ? new Date(consultation.date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            : ""}
        </CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Consultation Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="reason" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                Motif de Consultation
              </Label>
              <Input
                id="reason"
                placeholder="Motif de consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="font-medium"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="symptoms" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                Symptômes
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Description des symptômes..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagnosis" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Diagnostic
              </Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Diagnostic..."
                className="font-medium"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
              <Activity className="h-4 w-4" />
              Constantes Vitales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <HeartPulse className="h-3 w-3" />
                  Tension Artérielle
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="SYS"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="h-9"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    placeholder="DIA"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Droplet className="h-3 w-3" /> Glycémie (g/l)
                </Label>
                <Input
                  placeholder="Ex: 0.95"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Weight className="h-3 w-3" /> Poids (kg)
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label
              htmlFor="notes"
              className="text-left flex items-center gap-2 font-medium"
            >
              Notes Complémentaires
            </Label>
            <Textarea
              id="notes"
              placeholder="Autres observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Linked Records and Payment */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="rounded-lg border bg-primary/5 p-4 shrink-0">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-primary uppercase tracking-wide">
              <Banknote className="h-4 w-4" />
              Règlement
            </h3>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                Honoraires (DA)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="h-10 bg-background font-bold text-primary"
              />
            </div>
          </div>

          {linkedRecords.prescriptions.length > 0 && (
            <div className="rounded-lg border bg-card flex flex-col overflow-hidden">
              <div className="bg-primary/10 p-3 border-b border-primary/20 flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wide">
                  Ordonnances ({linkedRecords.prescriptions.length})
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                {linkedRecords.prescriptions.map((p, i) => (
                  <div key={p.id} className="border rounded-md p-3 space-y-2 bg-muted/20 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(p.prescriptionDate || p.createdAt).toLocaleDateString()}
                      </span>
                      {consultation?.patient && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PrintButton
                            patient={consultation.patient}
                            prescription={p.medications}
                            isPsychotropic={p.isPsychotropic}
                            psychotropicNumber={p.psychotropicNumber}
                            patientAddress={p.patientAddress}
                            prescriptionDate={p.prescriptionDate}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {(p.medications || []).map((med: any, idx: number) => (
                        <li key={idx} className="text-sm">
                          <span className="font-semibold">{med.medicineName}</span>
                          {med.dosage && <span className="text-muted-foreground"> - {med.dosage}</span>}
                          {med.duration && <span className="text-muted-foreground"> - {med.duration} jours</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkedRecords.documents.length > 0 && (
            <div className="rounded-lg border bg-card flex flex-col overflow-hidden">
              <div className="bg-blue-500/10 p-3 border-b border-blue-500/20 flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-sm text-blue-600 uppercase tracking-wide">
                  Bilans ({linkedRecords.documents.filter(d => d.type === 'blood').length})
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                {linkedRecords.documents.filter(d => d.type === 'blood').map((d, i) => (
                  <div key={d.id} className="border rounded-md p-3 space-y-2 bg-muted/20 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(d.documentDate || d.createdAt).toLocaleDateString()}
                      </span>
                      {consultation?.patient && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer select-none rounded-sm" onClick={(e) => {
                          e.stopPropagation();
                          handlePrintBilan(d);
                        }}>
                          {isPrintingBilan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                          Imprimer
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(d.content?.results || []).map((test: string, idx: number) => (
                        <span key={idx} className="bg-background border px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <CardFooter className="flex-none justify-between border-t p-4 shrink-0 bg-background">
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </CardFooter>
    </Card>
  );
}
