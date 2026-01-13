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
} from "lucide-react";
import { Consultation } from "../../type";
import { toast } from "sonner";

export default function SingleConsultation({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  // New state variables for form fields
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [weight, setWeight] = useState("");

  // Fetch patient data based on ID
  useEffect(() => {
    if (id) {
      window.electronAPI
        .getConsultation(id)
        /* eslint-disable  @typescript-eslint/no-explicit-any */

        .then((data: any) => {
          const extractedConsultation = data[0] || null;
          setConsultation(extractedConsultation);
          if (extractedConsultation) {
            setReason(extractedConsultation.reason || "");
            setSymptoms(extractedConsultation.symptoms || "");
            setDiagnosis(extractedConsultation.diagnosis || "");
            setNotes(extractedConsultation.notes || "");
            setGlucose(extractedConsultation.glucose || "");
            setWeight(extractedConsultation.weight || "");
            const bp = extractedConsultation.bloodPressure;

            if (bp && bp.includes("/")) {
              const [sys, dia] = bp.split("/");
              setBpSystolic(sys);
              setBpDiastolic(dia);
            } else {
              setBpSystolic("");
              setBpDiastolic("");
            }
          }
        })
        .catch((error: Error) =>
          console.error("Error fetching consultation:", error)
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Handle save consultation
  const handleSave = async () => {
    if (consultation) {
      const updatedConsultation = {
        ...consultation,
        reason, // ✅ Use updated state
        symptoms,
        diagnosis,
        bloodPressure:
          bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : null,
        glucose,
        weight,
        notes,
      };

      try {
        await window.electronAPI.editConsultation(updatedConsultation);
        toast.success("Consultation mise à jour avec succès !");
        const refreshedData = await window.electronAPI.getConsultation(id);
        setConsultation(refreshedData[0]);
        onClose();
      } catch (error) {
        console.error("Error saving consultation:", error);
        toast.error("Erreur lors de la mise à jour.");
      }
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-none">
      <CardHeader>
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
      <CardContent className="space-y-6">
        {/* Main Info */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reason" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              Raison de la visite
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
        </div>

        {/* Vitals Section */}
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
                <Droplet className="h-3 w-3" /> Glycémie (mg/dL)
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

        {/* Assessment */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="diagnosis" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Diagnostic
            </Label>
            <Textarea
              id="diagnosis"
              placeholder="Conclusion médicale..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="min-h-[80px] bg-muted/20"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes Complémentaires</Label>
            <Textarea
              id="notes"
              placeholder="Autres observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
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
