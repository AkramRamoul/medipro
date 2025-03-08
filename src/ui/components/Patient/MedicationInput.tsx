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

interface Medication {
  name: string;
  form: string;
  dosage: string;
  quantity?: string;
  duration?: string;
}

const MedicationsInput = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>(
    []
  );
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [quantity, setQuantity] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMedications = async () => {
    try {
      const meds = await window.electronAPI.getMedications();
      setMedications(meds);
    } catch (err) {
      console.error("Failed to load medications:", err);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setSelectedMedication(null);

    const filteredSuggestions = medications.filter((med) =>
      med.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setInputValue(
      `${medication.name} - ${medication.form} (${medication.dosage})`
    );
    setSuggestions([]);
  };

  const handleAddMedication = () => {
    if (selectedMedication) {
      const medicationWithExtras = {
        ...selectedMedication,
        quantity,
        duration,
      };
      setSelectedMedications((prev) => [...prev, medicationWithExtras]);
      setSelectedMedication(null);
      setInputValue("");
      setQuantity("");
      setDuration("");
    }
  };

  const handleRemoveMedication = (index: number) => {
    setSelectedMedications((prev) =>
      prev.filter((_, medIndex) => medIndex !== index)
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      handleSuggestionClick(suggestions[highlightedIndex]);
    }
  };
  const handleQteChange = (value: string) => {
    setQuantity(value);
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
  };

  return (
    <div className="relative">
      <div ref={containerRef} className="flex space-x-3">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a medication name..."
          className="border p-2 rounded w-full"
        />
        <Select value={quantity} onValueChange={handleQteChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Qte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1 bottle">1 bottle</SelectItem>
            <SelectItem value="2 bottle">2 bottle</SelectItem>
            <SelectItem value="3 bottle">3 bottle</SelectItem>
            <SelectItem value="4 bottle">4 bottle</SelectItem>
            <SelectItem value="5 bottle">5 bottle</SelectItem>
            <SelectItem value="6 bottle">6 bottle</SelectItem>
          </SelectContent>
        </Select>

        <Select value={duration} onValueChange={handleDurationChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1 week">1 week</SelectItem>
            <SelectItem value="2 weeks">2 week</SelectItem>
            <SelectItem value="1 month">3 week</SelectItem>
            <SelectItem value="2 moths">5 week</SelectItem>
            <SelectItem value="3 months">6 week</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAddMedication} disabled={!selectedMedication}>
          Add
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-10 bg-white border rounded w-full shadow-md max-h-60 overflow-y-auto">
          {suggestions.map((med, index) => (
            <div
              key={index}
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
                  {med.name} - {med.form} ({med.dosage}) | {med.quantity} |{" "}
                  {med.duration}
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
    </div>
  );
};

export default MedicationsInput;
