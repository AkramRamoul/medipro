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
  Plus,
  Banknote,
} from "lucide-react";
import { Consultation } from "../../type";
import { toast } from "sonner";
import api from "../../axios";


export default function SingleConsultation({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [customFieldConfigs, setCustomFieldConfigs] = useState<any[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

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
            setCustomFieldValues(consultationData.customFields || {});
          }

          const { data: fieldConfigs } = await api.get('/consultations/settings/custom-fields');
          setCustomFieldConfigs(fieldConfigs);
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
        customFields: customFieldValues,
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

  if (loading || !consultation) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-none overflow-auto">
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

        {customFieldConfigs.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
              <Plus className="h-4 w-4" />
              Champs personnalisés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFieldConfigs.map((config) => (
                <div key={config.id} className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    {config.label}
                  </Label>
                  <Input
                    type={config.type}
                    value={customFieldValues[config.name] || ""}
                    onChange={(e) =>
                      setCustomFieldValues((prev) => ({
                        ...prev,
                        [config.name]: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4">
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

        <div className="rounded-lg border bg-primary/5 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-primary uppercase tracking-wide">
            <Banknote className="h-4 w-4" />
            Règlement
          </h3>
          <div className="max-w-xs space-y-2">
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
