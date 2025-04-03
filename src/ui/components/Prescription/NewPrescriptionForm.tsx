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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toast } from "sonner";

interface Medication {
  id?: number; // Optional, only needed when retrieving stored medications
  name: string;
  form: string;
  dosage: string;
  quantity?: string;
  duration?: string;
}

const NewPrescriptionForm = ({
  id,
  onClose,
  refreshPrescriptions,
}: {
  id: string;
  onClose: () => void;
  refreshPrescriptions: () => void;
}) => {
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
  const [durationValue, setDurationValue] = useState<string>("");
  const [durationUnit, setDurationUnit] = useState<string>("weeks");

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
      alert("Please add at least one medication!");
      return;
    }

    const prescriptionData = {
      patientId: id,
      medications: selectedMedications.map((med) => ({
        medicineName: med.name,
        dosage: med.dosage,
        duration: med.duration,
        quantity: med.quantity,
        form: med.form,
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
        alert("Failed to save prescription: ");
      }
    } catch (error) {
      console.error("Failed to save prescription:", error);
    }
  };

  const handleAddMedication = () => {
    if (selectedMedication) {
      const medicationWithExtras = {
        ...selectedMedication,
        quantity,
        duration: durationValue ? `${durationValue} ${durationUnit}` : "",
      };
      setSelectedMedications((prev) => [...prev, medicationWithExtras]);
      setSelectedMedication(null);
      setInputValue("");
      setQuantity("");
      setDurationValue("");
      setDurationUnit("weeks");
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
      `${medication.name} - ${medication.form} (${medication.dosage})`
    );
    setSuggestions([]);
  };
  const handleRemoveMedication = (index: number) => {
    setSelectedMedications((prev) =>
      prev.filter((_, medIndex) => medIndex !== index)
    );
  };

  const handlePrint = async () => {
    if (selectedMedications.length === 0) {
      alert("No medications to print!");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([420, 595]); // A5 Paper Size
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Prescription", {
      x: 40,
      y: height - 40,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    let yPos = height - 80;
    const rowHeight = 18;

    selectedMedications.forEach((med) => {
      const formattedText = `${med.name} - ${med.form} (${med.dosage}) | ${
        med.quantity || "-"
      } | ${med.duration || "-"}`;

      page.drawText(formattedText, {
        x: 40,
        y: yPos,
        font,
        size: 10,
        color: rgb(0, 0, 0),
      });

      yPos -= rowHeight;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl);

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Qte" />
          </SelectTrigger>
          <SelectContent>
            {["1 bottle", "2 bottle", "3 bottle", "4 bottle", "5 bottle"].map(
              (q, index) => (
                <SelectItem key={index} value={q}>
                  {q}
                </SelectItem>
              )
            )}
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
        <Input type="text" value="" placeholder="note" className="w-[500px]" />

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

      <div className="flex justify-end space-x-3 mt-4 p-4 border-t">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
          Save
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-600"
        >
          Print
        </Button>
        <Button onClick={onClose} variant="destructive">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default NewPrescriptionForm;
