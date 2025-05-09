import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Patient } from "../../type";
import { toast } from "sonner";

function NewConsultationForm({
  id,
  onClose,
  refreshConsultations, // ✅ Receive the function as a prop
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

  useEffect(() => {
    if (id) {
      window.electronAPI
        .getpatient(id)
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        .then((data: any) => {
          const extractedPatient = data[0]
            ? { ...data[0], createdAt: data.createdAt }
            : null;
          console.log("📢 Extracted Patient Data:", extractedPatient);
          setPatient(extractedPatient);
        })
        .catch((error: Error) =>
          console.error("Error fetching patient:", error)
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!patient) return;

    const consultationData = {
      patientId: id,
      reason,
      symptoms,
      diagnosis,
      notes,
    };

    console.log("Saving consultation:", consultationData);
    try {
      await window.electronAPI.addConsultation(consultationData);
      toast.success("Consultation saved successfully!");
      refreshConsultations(); // ✅ Refresh consultations dynamically
      onClose();
    } catch (error) {
      console.error("Failed to save consultation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-4 max-w-2xl mx-auto bg-background">
      <h2 className="text-2xl font-bold">Nouvelle consultation</h2>
      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-3">
          <Label>Raison de la visite</Label>
          <Input
            placeholder="Raison de la visite"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Symptômes</Label>
          <Textarea
            placeholder="Entrez les symptômes ici..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Diagnostic</Label>
          <Textarea
            placeholder="Diagnostic du médecin"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Notes</Label>
          <Textarea
            placeholder="Notes supplémentaires"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button className="bg-primary" onClick={handleSave}>
          Enregistrer la consultation
        </Button>
      </div>
    </Card>
  );
}

export default NewConsultationForm;
