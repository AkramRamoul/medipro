import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Patient } from "../../type";
import NewPrescriptionForm from "./NewPrescriptionForm";

interface GenericPrescriptionModalProps {
  onClose: () => void;
  refreshPrescriptions: () => void;
  onStepChange?: (step: 1 | 2) => void;
}

export default function GenericPrescriptionModal({
  onClose,
  refreshPrescriptions,
  onStepChange,
}: GenericPrescriptionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");

  const handleNext = () => {
    if (!firstName || !lastName) {
      return;
    }

    const gender = "Non spécifié";
    const tempPatient: Patient = {
      id: 0,
      first_name: firstName,
      last_name: lastName,
      age: Number(age) || 0,
      gender: gender,
      contact: "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setPatient(tempPatient);
    setStep(2);
    onStepChange?.(2);
  };

  return (
    <div className="h-full">
      {step === 1 ? (
        <div className="space-y-6 max-w-md mx-auto py-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Détails du Patient
          </h2>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nom du patient"
            />
          </div>
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Prénom du patient"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Âge</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Âge"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleNext} disabled={!firstName || !lastName}>
              Suivant
            </Button>
          </div>
        </div>
      ) : (
        <NewPrescriptionForm
          id={patient!.id.toString()}
          onClose={onClose}
          refreshPrescriptions={refreshPrescriptions}
          patient={patient!}
        />
      )}
    </div>
  );
}
