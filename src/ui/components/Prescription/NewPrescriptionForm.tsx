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

  // Save prescription to the database
  const handleSave = async () => {
    if (selectedMedications.length === 0) {
      toast.error("Please add at least one medication!");
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
    };

    try {
      const response = await window.electronAPI.addFullPrescription(
        prescriptionData
      );

      if (response.success) {
        toast.success("saved successfully!");
        refreshPrescriptions();
        onClose();
      } else {
        toast.error("Failed to save prescription: ");
      }
    } catch (error) {
      console.error("Failed to save prescription:", error);
    }
  };

  const handleAddMedication = () => {
    if (selectedMedication) {
      const medicationWithExtras: PrescriptionMed = {
        id: selectedMedication.id || 0,
        prescriptionId: 0, // Replace with the actual prescriptionId if available
        medicineName: selectedMedication.name,
        dosage: selectedMedication.dosage,
        quantity: quantity || null,
        form: selectedMedication.form || null,
        duration: durationValue ? `${durationValue} ${durationUnit}` : null,
        note: note || null,
      };
      setSelectedMedications((prev) => [...prev, medicationWithExtras]);
      setSelectedMedication(null);
      setInputValue("");
      setQuantity("");
      setDurationValue("");
      setDurationUnit("weeks");
      setNote(""); // Reset note field after adding
    }
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
    <div className="relative mt-8">
      <div ref={containerRef} className="flex space-x-3">
        <Input
          type="text"
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          placeholder="Type a medication name..."
          className="border p-2 rounded w-[250px]"
        />

        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Qte" />
          </SelectTrigger>
          <SelectContent>
            {["1 bte", "2 bte", "3 bte", "4 bte", "5 bte"].map((q, index) => (
              <SelectItem key={index} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={durationValue}
          onChange={(e) => setDurationValue(e.target.value)}
          placeholder="Duration"
          className="border p-2 rounded w-[100px]"
        />
        <Select value={durationUnit} onValueChange={setDurationUnit}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {["days", "weeks", "months"].map((unit, index) => (
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
          placeholder="Add a note..."
          className="w-[500px] border p-2 rounded"
        />

        <Button onClick={handleAddMedication} disabled={!selectedMedication}>
          Add
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div
          id="suggestions-list"
          className="absolute z-10 bg-white border rounded w-full shadow-md max-h-60 overflow-y-auto"
        >
          {suggestions.map((med, index) => (
            <div
              key={index}
              id={`suggestion-${index}`} // Add an ID for each suggestion
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                index === highlightedIndex ? "bg-gray-200" : ""
              }`}
              onMouseDown={() => handleSuggestionClick(med)}
            >
              {med.name} - {med.form} ({med.dosage})
            </div>
          ))}
        </div>
      )}

      {selectedMedications.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Selected Medications:</h3>
          <ul className="space-y-2">
            {selectedMedications.map((med, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span>
                  - {med.medicineName} {med.form ? `${med.form}` : ""}{" "}
                  {med.dosage} {med.quantity ? `${med.quantity}` : ""}{" "}
                  {med.duration ? `${med.duration}` : ""}
                  {med.note}
                </span>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveMedication(index)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-4 p-4 border-t">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
          Save
        </Button>
        <PrintButton
          prescription={selectedMedications}
          patient={patient}
          window={window}
        ></PrintButton>
        <Button onClick={onClose} variant="destructive">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default NewPrescriptionForm;
