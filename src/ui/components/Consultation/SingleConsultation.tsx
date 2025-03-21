import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Consultation } from "../../type";

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

  // Fetch patient data based on ID
  useEffect(() => {
    if (id) {
      window.electronAPI
        .getConsultation(id)
        /* eslint-disable  @typescript-eslint/no-explicit-any */

        .then((data: any) => {
          const extractedConsultation = data[0]
            ? { ...data[0], createdAt: data.createdAt }
            : null;
          console.log("📢 Extracted Patient Data:", extractedConsultation);
          setConsultation(extractedConsultation);
          console.log("📢 Consultation Data:", extractedConsultation);
        })
        .catch((error: Error) =>
          console.error("Error fetching patient:", error)
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Handle save consultation
  const handleSave = async () => {
    if (!consultation) return;

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
      onClose();
    } catch (error) {
      console.error("Failed to save consultation:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">
        Cosultation du : {consultation?.date}
      </h2>

      {/* Patient Info */}
      {/* Consultation Details */}
      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-1">
          <Label>Reason for Visit</Label>
          <Input
            readOnly
            placeholder="Short description"
            value={consultation?.reason || ""}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Symptoms</Label>
          <Textarea
            readOnly
            placeholder="List symptoms here..."
            value={consultation?.symptoms || ""}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Diagnosis</Label>
          <Textarea
            readOnly
            placeholder="Doctor's diagnosis"
            value={consultation?.diagnosis || ""}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Notes</Label>
          <Textarea
            readOnly
            placeholder="How should the patient take the medication?"
            value={consultation?.notes || ""}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSave}
        >
          Save Consultation
        </Button>
      </div>
    </Card>
  );
}

export default SingleConsultation;
