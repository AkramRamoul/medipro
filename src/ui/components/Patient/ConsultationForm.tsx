import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

function ConsultationForm() {
  return (
    <Card className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">New Consultation</h2>

      {/* Patient Info */}
      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-1">
          <Label>Patient Name</Label>
          <Input value="{patient.name}" readOnly />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Age & Gender</Label>
          <Input value={`{age} • {patient.gender}`} readOnly />
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
          <Label>Prescribed Medications</Label>
          <Input placeholder="Enter medication name" />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Dosage Instructions</Label>
          <Textarea placeholder="How should the patient take the medication?" />
        </div>
      </div>

      {/* Follow-Up */}
      <div className="flex items-center space-x-4">
        <Switch id="follow-up" />
        <Label htmlFor="follow-up">Follow-Up Required?</Label>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-start space-y-1">
          <Label>Next Appointment</Label>
          <Input type="date" />
        </div>
        <div className="flex flex-col items-start space-y-1">
          <Label>Recommended Tests</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select tests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blood-test">Blood Test</SelectItem>
              <SelectItem value="x-ray">X-Ray</SelectItem>
              <SelectItem value="mri">MRI Scan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
