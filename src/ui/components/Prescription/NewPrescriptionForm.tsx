import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { Patient } from "../../type";
import PrintButton from "../PrintButton";
import { PrescriptionMed } from "../../../electron/schema";

interface Medication {
  id?: number;
  name: string;
  form: string;
  dosage: string;
  quantity?: string;
  duration?: string;
  note?: string; // Add note field
}

const NewPrescriptionForm = ({
  id,
  onClose,
  refreshPrescriptions,
  patient,
}: {
  id: string;
  onClose: () => void;
  refreshPrescriptions: () => void;
  patient: Patient;
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Medication[]>([]);

  const [selectedMedications, setSelectedMedications] = useState<
    PrescriptionMed[]
  >([]);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [quantity, setQuantity] = useState<string>("");
  const [durationValue, setDurationValue] = useState<string>("");
  const [durationUnit, setDurationUnit] = useState<string>("weeks");
  const [note, setNote] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMedications = async () => {
    try {
      const meds = await window.electronAPI.getMedications();
      setMedications(meds);
    } catch (err) {
      console.error("Failed to load medications:", err);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      setHighlightedIndex((prev) => {
        const newIndex = Math.min(prev + 1, suggestions.length - 1);
        scrollToHighlighted(newIndex);
        return newIndex;
      });
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prev) => {
        const newIndex = Math.max(prev - 1, 0);
        scrollToHighlighted(newIndex);
        return newIndex;
      });
    } else if (event.key === "Enter" && highlightedIndex !== -1) {
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (event.key === "Escape") {
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  // Function to scroll the highlighted suggestion into view
  const scrollToHighlighted = (index: number) => {
    const suggestionElement = document.getElementById(`suggestion-${index}`);
    if (suggestionElement) {
      suggestionElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };
  const [isPsychotropic, setIsPsychotropic] = useState(false);
  const [psychotropicNumber, setPsychotropicNumber] = useState("");
  const [patientAddress, setPatientAddress] = useState(patient?.address || "");
  // Save prescription to the database
  const handleSave = async () => {
    if (selectedMedications.length === 0) {
      toast.error("Veuillez ajouter au moins un médicament !");
      return;
    }

    const prescriptionData = {
      patientId: id,
      medications: selectedMedications.map((med) => ({
        medicineName: med.medicineName,
        dosage: med.dosage,
        duration: med.duration,
        quantity: med.quantity,
        form: med.form,
        note: med.note, // Include note in request
      })),
      isPsychotropic,
      patientAddress,
    };

    try {
      const response = await window.electronAPI.addFullPrescription(
        prescriptionData
      );

      if (response.success) {
        if (response.psychotropic_number) {
          setPsychotropicNumber(response.psychotropic_number.toString());
        }
        toast.success("enregistré avec succès !");
        refreshPrescriptions();
        onClose();
      } else {
        toast.error("Échec de l'enregistrement de l'ordonnance :");
      }
    } catch (error) {
      console.error("Failed to save prescription:", error);
    }
  };

  const fetchPsychotropicNumber = async () => {
    try {
      const number = await window.electronAPI.getNextPsychotropicNumber();
      setPsychotropicNumber(number.toString());
    } catch (err) {
      toast.error("Échec du chargement du numéro psychotrope");
      console.error(err);
    }
  };

  const handleAddMedication = () => {
    const medName = selectedMedication
      ? selectedMedication.name
      : inputValue.trim();

    if (!medName) {
      toast.error("Le nom du médicament ne peut pas être vide.");
      return;
    }

    const medicationWithExtras: PrescriptionMed = {
      id: selectedMedication?.id || 0,
      prescriptionId: 0,
      medicineName: medName,
      dosage: selectedMedication?.dosage || "",
      quantity: quantity || null,
      form: selectedMedication?.form || "",
      duration: durationValue ? `${durationValue} ${durationUnit}` : null,
      note: note || null,
    };

    setSelectedMedications((prev) => [...prev, medicationWithExtras]);
    setSelectedMedication(null);
    setInputValue("");
    setQuantity("");
    setDurationValue("");
    setDurationUnit("weeks");
    setNote("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setSelectedMedication(null);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filteredSuggestions = medications.filter((med) =>
      med.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
    setHighlightedIndex(-1);
  };
  const handleSuggestionClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setInputValue(
      `${medication.name} - ${medication.form} (${medication.dosage} - ${medication.quantity}) ${medication.duration} ${medication.note}`
    );
    setSuggestions([]);
  };
  const handleRemoveMedication = (index: number) => {
    setSelectedMedications((prev) =>
      prev.filter((_, medIndex) => medIndex !== index)
    );
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <div className="relative mt-10">
      {/* Medication Form Row */}
      <div ref={containerRef} className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          placeholder="Tapez le nom d'un médicament..."
          className="w-[350px] bg-background text-foreground"
        />

        <Input
          type="number"
          min={1}
          value={quantity.replace(" bte", "")}
          onChange={(e) => {
            const val = e.target.value;
            setQuantity(val ? `${val} bte` : "");
          }}
          placeholder="Qte"
          className="w-[100px] bg-background text-foreground"
        />
        <span className="text-foreground text-sm ">Ou</span>
        <Input
          type="number"
          value={durationValue}
          onChange={(e) => setDurationValue(e.target.value)}
          placeholder="Qsp"
          className="w-[80px] bg-background text-foreground"
        />

        <Select value={durationValue || ""} onValueChange={setDurationUnit}>
          <SelectTrigger className="w-[120px] bg-background text-foreground">
            <SelectValue placeholder="durée" />{" "}
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground">
            {["jours", "semaines", "mois"].map((unit, index) => (
              <SelectItem key={index} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ajouter une note..."
          className="w-[200px] bg-background text-foreground"
        />
        <div className="flex items-center gap-2 mt-4 w-full">
          <input
            type="checkbox"
            id="psychotropic"
            checked={isPsychotropic}
            onChange={async (e) => {
              const checked = e.target.checked;
              setIsPsychotropic(checked);
              if (checked) {
                await fetchPsychotropicNumber();
                if (patient?.address) {
                  setPatientAddress(patient.address);
                }
              } else {
                setPsychotropicNumber(""); // Clear if unchecked
              }
            }}
          />
          <label htmlFor="psychotropic" className="text-foreground text-sm">
            Ce traitement contient un psychotrope
          </label>
        </div>

        {/* Conditional Psychotropic Fields */}
        {isPsychotropic && (
          <div className="flex flex-col gap-2 w-full mt-2">
            <Input
              type="text"
              value={psychotropicNumber}
              readOnly
              placeholder="Numéro de prescription psychotrope"
              className="bg-muted text-foreground"
            />
            <Input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              placeholder="Adresse du patient"
              className="bg-background text-foreground"
            />
          </div>
        )}

        <Button
          className="text-white"
          onClick={handleAddMedication}
          disabled={inputValue.trim() === ""}
        >
          Ajouter
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full max-h-60 overflow-y-auto bg-popover border border-border rounded shadow-md mt-2">
          {suggestions.map((med, index) => (
            <div
              key={index}
              id={`suggestion-${index}`}
              className={`p-2 cursor-pointer hover:bg-muted ${
                index === highlightedIndex ? "bg-muted" : ""
              }`}
              onMouseDown={() => handleSuggestionClick(med)}
            >
              {med.name} - {med.form} ({med.dosage})
            </div>
          ))}
        </div>
      )}

      {/* Selected Medications */}
      {selectedMedications.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-foreground">
            Médicaments sélectionnés:
          </h3>
          <ul className="space-y-2">
            {selectedMedications.map((med, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted p-2 rounded"
              >
                <span>
                  - {med.medicineName} {med.form ? `${med.form}` : ""}{" "}
                  {med.dosage} {med.quantity ? `${med.quantity}` : ""}{" "}
                  {med.duration ? `${med.duration}` : ""} {med.note}
                </span>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveMedication(index)}
                >
                  Supprimer
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4 p-4 border-t border-border">
        <Button onClick={handleSave} className="text-white">
          Enregistrer
        </Button>
        <PrintButton
          prescription={selectedMedications}
          patient={patient}
          window={window}
          isPsychotropic={isPsychotropic}
          psychotropicNumber={Number(psychotropicNumber)}
          patientAddress={patientAddress}
        />
        <Button onClick={onClose} variant="outline">
          Annuler{" "}
        </Button>
      </div>
    </div>
  );
};

export default NewPrescriptionForm;
