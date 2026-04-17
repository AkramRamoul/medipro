import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Patient } from "../../type";
import NewPrescriptionForm from "./NewPrescriptionForm";
import { User, ArrowRight, ChevronRight, Pill, Hash } from "lucide-react";
import { cn } from "../../lib/utils";

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

  const lastNameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);

  const isValid = firstName.trim() !== "" && lastName.trim() !== "";

  const handleNext = () => {
    if (!isValid) return;

    const tempPatient: Patient = {
      id: 0,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      age: Number(age) || 0,
      gender: "Non spécifié",
      contact: "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setPatient(tempPatient);
    setStep(2);
    onStepChange?.(2);
  };

  const handleBack = () => {
    setStep(1);
    onStepChange?.(1);
  };

  // Initials avatar derived from entered names
  const initials =
    (firstName?.[0] ?? "") + (lastName?.[0] ?? "");

  return (
    <div className="h-full">
      {step === 1 ? (
        <div className="space-y-6 px-2 py-2">
          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
            <span className="flex items-center gap-1.5 font-semibold text-primary">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                1
              </span>
              Informations patient
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className="flex items-center gap-1.5 opacity-40">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-muted-foreground/30 text-[10px] font-bold">
                2
              </span>
              Médicaments
            </span>
          </div>

          {/* Avatar + heading */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300",
                initials
                  ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {initials ? (
                initials.toUpperCase()
              ) : (
                <User className="w-6 h-6 opacity-50" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : "Nouveau patient"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Renseignez les informations pour continuer
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* First name */}
            <div className="space-y-1.5">
              <Label htmlFor="gpm-fname" className="text-xs font-medium">
                Nom <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="gpm-fname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex : Dupont"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") lastNameRef.current?.focus();
                  }}
                  className={cn(
                    "pr-8 transition-all",
                    firstName && "border-primary/40 ring-1 ring-primary/10"
                  )}
                />
                {firstName && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Last name */}
            <div className="space-y-1.5">
              <Label htmlFor="gpm-lname" className="text-xs font-medium">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="gpm-lname"
                  ref={lastNameRef}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex : Jean"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") ageRef.current?.focus();
                  }}
                  className={cn(
                    "pr-8 transition-all",
                    lastName && "border-primary/40 ring-1 ring-primary/10"
                  )}
                />
                {lastName && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <Label htmlFor="gpm-age" className="text-xs font-medium flex items-center gap-1.5">
                <Hash className="w-3 h-3 opacity-60" />
                Âge
                <span className="text-muted-foreground font-normal">(optionnel)</span>
              </Label>
              <Input
                id="gpm-age"
                ref={ageRef}
                type="number"
                min={0}
                max={130}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Âge en années"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) handleNext();
                }}
              />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-primary/80 col-span-1 self-end mb-0.5">
              <Pill className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Le nom et le prénom sont requis pour générer l&apos;ordonnance.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              Annuler
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isValid}
              className="gap-2 min-w-[130px]"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <NewPrescriptionForm
          id={patient!.id.toString()}
          onClose={onClose}
          onBack={handleBack}
          refreshPrescriptions={refreshPrescriptions}
          patient={patient!}
        />
      )}
    </div>
  );
}
