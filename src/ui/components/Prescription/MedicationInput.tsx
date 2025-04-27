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
import { useParams } from "react-router-dom";
import { toast } from "sonner";

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
  const { id } = useParams<{ id: string }>();
  console.log(id);
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
    if (event.key === "ArrowDown") {
      setHighlightedIndex((prev) => {
        const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
        scrollToHighlighted(newIndex);
        return newIndex;
      });
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prev) => {
        const newIndex = prev > 0 ? prev - 1 : prev;
        scrollToHighlighted(newIndex);
        return newIndex;
      });
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      handleSuggestionClick(suggestions[highlightedIndex]);
    }
  };

  const scrollToHighlighted = (index: number) => {
    const suggestionList = document.getElementById("suggestions-list");
    if (suggestionList) {
      const item = suggestionList.children[index] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
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

  const handlePrint = async () => {
    if (selectedMedications.length === 0) {
      toast.error("No medications to print!");
      return;
    }

    // Create a new PDF Document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([420, 595]); // A5 Paper Size
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("Medications List", {
      x: 40,
      y: height - 40,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    // Start position for text
    let yPos = height - 80;
    const rowHeight = 18;

    // Loop through medications and print in requested format
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

    // Save PDF as bytes
    const pdfBytes = await pdfDoc.save();

    // Convert to Blob and open in new tab
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl);

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print(); // Automatically trigger print dialog
      };
    }
  };

  return (
    <div className="relative">
      <Button onClick={handlePrint} className="ml-3">
        Print PDF
      </Button>

      <div ref={containerRef} className="flex space-x-3">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a medication name..."
          className="border p-2 rounded w-full"
        />

        <Select value={quantity} onValueChange={setQuantity}>
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
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="weeks">Weeks</SelectItem>
            <SelectItem value="months">Months</SelectItem>
          </SelectContent>
        </Select>

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
