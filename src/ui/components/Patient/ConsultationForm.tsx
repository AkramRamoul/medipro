import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Patient } from "../../type";

function ConsultationForm({ id }: { id: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

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
  console.log(patient);

  if (loading) {
    <div className="flex items-center justify-center py-10">
      <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      <span className="ml-2 text-muted-foreground">Loading...</span>
    </div>;
  }
  return (
    <Card className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">New Consultation</h2>

      {/* Patient Info */}
      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-1">
          <Label>Patient Name</Label>
          <Input value={patient?.name || ""} readOnly />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Age & Gender</Label>
          <Input
            className="font-semibold"
            value={`${patient?.age || ""} • ${patient?.gender || ""}`}
            readOnly
          />
        </div>
      </div>

      {/* Symptoms & Diagnosis */}
      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-1">
          <Label>Reason for Visit</Label>
          <Input placeholder="Short description" />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Symptoms</Label>
          <Textarea placeholder="List symptoms here..." />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Diagnosis</Label>
          <Textarea placeholder="Doctor's diagnosis" />
        </div>
      </div>

      {/* Medications & Follow-Up */}
      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-1">
          <Label>Dosage Instructions</Label>
          <Textarea placeholder="How should the patient take the medication?" />
        </div>
      </div>

      {/* Follow-Up */}

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <Button variant="ghost">Cancel</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Save Consultation
        </Button>
      </div>
    </Card>
  );
}

export default ConsultationForm;
