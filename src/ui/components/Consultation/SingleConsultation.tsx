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
        notes,
      };

      try {
        await window.electronAPI.editConsultation(updatedConsultation);
        toast.success("Consultation updated successfully!");
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
            placeholder="Short description"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Symptoms</Label>
          <Textarea
            placeholder="List symptoms here..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Diagnosis</Label>
          <Textarea
            placeholder="Doctor's diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Notes</Label>
          <Textarea
            placeholder="How should the patient take the medication?"
            value={notes}
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
