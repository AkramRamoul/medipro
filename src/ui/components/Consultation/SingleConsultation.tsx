import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Consultation } from "../../type";
import { toast } from "sonner";

function SingleConsultation({
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
    <Card className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">
        Consultation du :{" "}
        {consultation?.date
          ? new Date(consultation.date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Date not available"}
      </h2>

      {/* Patient Info */}
      {/* Consultation Details */}
      <div className="space-y-6">
        <div className="flex flex-col items-start space-y-1">
          <Label className="mb-2">Raison de la visite</Label>
          <Input
            placeholder="Brève description de la raison de la consultation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Symptômes</Label>
          <Textarea
            placeholder="Entrez les symptômes ici..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>
        <div>
          <Label>Tension Artérielle</Label>
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
            placeholder="Notes supplementaires"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Annuler
        </Button>
        <Button className="bg-primary text-white" onClick={handleSave}>
          Modifier Consultation
        </Button>
      </div>
    </Card>
  );
}

export default SingleConsultation;
