import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Patient } from "../../type";
import { toast } from "sonner";

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

  // Vitals
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [weight, setWeight] = useState("");

  const [isOpen, setIsOpen] = useState(false);

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
      },
    };
    console.log("📢 Sending consultation data:", consultationData);

    try {
      await window.electronAPI.addConsultation(consultationData);
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
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-4 max-w-2xl mx-auto bg-background">
      <h2 className="text-2xl font-bold">Nouvelle consultation</h2>

      <div className="space-y-4">
        <div>
          <Label>Raison de la visite</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div>
          <Label>Symptômes</Label>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div>
          <Label>Diagnostic</Label>
          <Textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Vitals */}
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="border rounded-md p-4 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold">Signes vitaux</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-4 space-y-4">
            <div>
              <Label>Tension artérielle</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="SYS"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="DIA"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Glycémie sanguine</Label>
                <Input
                  type="number"
                  placeholder="mg/dL"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                />
              </div>
              <div>
                <Label>Poids</Label>
                <Input
                  type="number"
                  placeholder="kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave}>Enregistrer la consultation</Button>
      </div>
    </Card>
  );
}

export default NewConsultationForm;
