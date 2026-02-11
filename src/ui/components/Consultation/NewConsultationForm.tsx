import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import {
  Activity,
  Heart,
  Loader2,
  Stethoscope,
  Weight,
  Thermometer,
  FileText,
  AlertCircle,
  ClipboardList,
  Save,
  X,
  Plus,
  Banknote,
} from "lucide-react";
import { Patient } from "../../type";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { ICD10Search } from "./ICD10Search";

function NewConsultationForm({
  id,
  onClose,
  refreshConsultations,
}: {
  id: string;
  onClose: () => void;
  refreshConsultations: () => void;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customFieldConfigs, setCustomFieldConfigs] = useState<any[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >({});

  useEffect(() => {
    if (!id) return;

    window.electronAPI
      /* eslint-disable @typescript-eslint/no-explicit-any */
      .getpatient(id)
      .then((data: any) => {
        setPatient(data?.[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    window.electronAPI.getCustomFields().then((fields) => {
      setCustomFieldConfigs(fields);
      const initialValues: Record<string, any> = {};
      fields.forEach((f: any) => {
        initialValues[f.name] = "";
      });
      setCustomFieldValues(initialValues);
    });
  }, [id]);

  const handleSave = async () => {
    if (!patient) return;

    const consultationData = {
      patientId: Number(id),
      reason,
      symptoms,
      diagnosis,
      notes,
      vitals: {
        bpSystolic: bpSystolic ? bpSystolic : null,
        bpDiastolic: bpDiastolic ? bpDiastolic : null,
        glucose: glucose ? glucose : null,
        weight: weight ? weight : null,
        temperature: temperature ? temperature : null,
      },
      amountPaid: amountPaid ? Math.round(Number(amountPaid)) : null,
      customFields: customFieldValues,
    };

    try {
      await window.electronAPI.addConsultation(consultationData);
      window.dispatchEvent(
        new CustomEvent("patient-vitals-updated", {
          detail: { patientId: Number(id) },
        }),
      );
      window.dispatchEvent(new Event("consultations-updated"));
      toast.success("Consultation enregistrée avec succès !");
      refreshConsultations();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'enregistrement de la consultation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
      <CardHeader className="pb-4 border-b mb-6">
        <CardTitle className="flex items-center gap-3 text-2xl text-primary">
          <Stethoscope className="w-8 h-8" />
          Nouvelle Consultation
        </CardTitle>
        <p className="text-muted-foreground mt-1">
          Remplissez les détails de la consultation pour {patient?.first_name}{" "}
          {patient?.last_name}
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Section 1: Clinical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <ClipboardList className="w-4 h-4 text-primary" />
                Motif de Consultation
              </Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Douleurs abdominales, Fièvre..."
                className="bg-muted/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Symptômes
              </Label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Description détaillée des symptômes..."
                className="min-h-[120px] bg-muted/30 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <Activity className="w-4 h-4 text-blue-500" />
                Diagnostic
              </Label>
              <ICD10Search
                value={diagnosis}
                onChange={setDiagnosis}
                placeholder="Rechercher un diagnostic (CIM-10)..."
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <FileText className="w-4 h-4 text-gray-500" />
                Notes additionnelles
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, remarques..."
                className="min-h-[80px] bg-muted/30 resize-none"
              />
            </div>
          </div>
        </div>

        {customFieldConfigs.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                Champs personnalisés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customFieldConfigs.map((config) => (
                  <div key={config.id} className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium">
                      {config.label}
                    </Label>
                    {config.type === "textarea" ? (
                      <Textarea
                        value={customFieldValues[config.name] || ""}
                        onChange={(e) =>
                          setCustomFieldValues((prev) => ({
                            ...prev,
                            [config.name]: e.target.value,
                          }))
                        }
                        className="bg-muted/30 min-h-[100px]"
                      />
                    ) : (
                      <Input
                        type={config.type}
                        value={customFieldValues[config.name] || ""}
                        onChange={(e) =>
                          setCustomFieldValues((prev) => ({
                            ...prev,
                            [config.name]: e.target.value,
                          }))
                        }
                        className="bg-muted/30"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Section 2: Vitals */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Activity className="w-5 h-5" />
            Constantes Vitales
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Heart className="w-3 h-3" /> Tension (SYS/DIA)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="bg-background text-center"
                />
                <span className="text-xl text-muted-foreground font-light">
                  /
                </span>
                <Input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="bg-background text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Weight className="w-3 h-3" /> Poids (kg)
              </Label>
              <Input
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Activity className="w-3 h-3" /> Glycémie (mg/dL)
              </Label>
              <Input
                type="number"
                placeholder="100"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> Température (°C)
              </Label>
              <Input
                type="number"
                placeholder="37.0"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 3: Payment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Banknote className="w-5 h-5" />
            Paiement
          </h3>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 max-w-xs">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                Honoraires (DA)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="bg-background border-primary/20 font-bold text-primary text-lg"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            size="lg"
            className="gap-2 min-w-[150px]"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewConsultationForm;
