import { useEffect, useRef, useState, useCallback } from "react";
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
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus, Trash2, Pill, AlertTriangle, Save, X } from "lucide-react";

interface Medication {
  id?: number;
  name: string;
  form: string;
  dosage: string;
  quantity?: string;
  duration?: string;
  note?: string;
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
  const [isSearching, setIsSearching] = useState(false);

  const [selectedMedications, setSelectedMedications] = useState<
    PrescriptionMed[]
  >([]);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [quantity, setQuantity] = useState<string>("");
  const [durationValue, setDurationValue] = useState<string>("");
  const [durationUnit, setDurationUnit] = useState<string | undefined>(
    undefined,
  );
  const [note, setNote] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Maximum number of suggestions to show
  const MAX_SUGGESTIONS = 50;

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
  const handleSave = async () => {
    if (Number(id) === 0) {
      toast.error("Impossible d'enregistrer pour un patient manuel.");
      return;
    }

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
        note: med.note,
      })),
      isPsychotropic,
      patientAddress,
    };

    try {
      const response =
        await window.electronAPI.addFullPrescription(prescriptionData);

      if (response.success) {
        if (response.psychotropic_number) {
          setPsychotropicNumber(response.psychotropic_number.toString());
        }
        toast.success("enregistré avec succès !");
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
      duration: durationValue
        ? `${durationValue} ${durationUnit || "jours"}`
        : null,
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

  // Optimized search function with better scoring
  const searchMedications = useCallback((query: string) => {
    if (query.trim() === "") {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const lower = query.toLowerCase();
    const words = lower.split(/\s+/);

    // Score each medication based on match quality
    const scored = medications
      .map((med) => {
        const nameLower = med.name.toLowerCase();
        let score = 0;

        // Exact match (highest priority)
        if (nameLower === lower) {
          score = 1000;
        }
        // Starts with query
        else if (nameLower.startsWith(lower)) {
          score = 500;
        }
        // Contains all words at word boundaries
        else if (words.every(word => {
          const regex = new RegExp(`\\b${word}`, 'i');
          return regex.test(nameLower);
        })) {
          score = 300;
        }
        // Contains query as substring
        else if (nameLower.includes(lower)) {
          score = 200;
        }
        // Contains all individual words
        else if (words.every(word => nameLower.includes(word))) {
          score = 100;
        }
        // No match
        else {
          return null;
        }

        // Bonus for shorter names (more specific)
        score += Math.max(0, 50 - med.name.length);

        return { med, score };
      })
      .filter((item): item is { med: Medication; score: number } => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map(item => item.med);

    setSuggestions(scored);
    setHighlightedIndex(-1);
    setIsSearching(false);
  }, [medications]);

  // Debounced input handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setSelectedMedication(null);
    setIsSearching(true);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchMedications(value);
    }, 300); // 300ms debounce delay
  };

  const handleSuggestionClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setInputValue(
      `${medication.name} - ${medication.form} (${medication.dosage} - ${medication.quantity}) ${medication.duration} ${medication.note}`,
    );
    setSuggestions([]);
  };
  const handleRemoveMedication = (index: number) => {
    setSelectedMedications((prev) =>
      prev.filter((_, medIndex) => medIndex !== index),
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchMedications();

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Ajouter un médicament
          </CardTitle>
          <CardDescription>
            Recherchez et ajoutez des médicaments à l'ordonnance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div ref={containerRef} className="md:col-span-4 relative space-y-2">
              <Label>Médicament</Label>
              <Input
                type="text"
                value={inputValue}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                placeholder="Nom du médicament..."
                className="w-full"
                autoFocus
              />
              {/* Suggestions Dropdown */}
              {(suggestions.length > 0 || isSearching) && (
                <div className="absolute z-50 w-full max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg mt-1">
                  {isSearching ? (
                    <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                      Recherche...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((med, index) => (
                        <div
                          key={`${med.name}-${index}`}
                          id={`suggestion-${index}`}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${index === highlightedIndex
                            ? "bg-accent text-accent-foreground"
                            : ""
                            }`}
                          onMouseDown={() => handleSuggestionClick(med)}
                        >
                          <div className="font-medium">{med.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {med.form} • {med.dosage}
                          </div>
                        </div>
                      ))}
                      {suggestions.length === MAX_SUGGESTIONS && (
                        <div className="px-3 py-2 text-xs text-center text-muted-foreground border-t">
                          Affichage des {MAX_SUGGESTIONS} premiers résultats. Affinez votre recherche.
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="md:col-span-2 space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                min={1}
                value={quantity.replace(" bte", "")}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantity(val ? `${val} bte` : "");
                }}
                placeholder="Qte"
              />
            </div>

            {/* Duration */}
            <div className="md:col-span-3 space-y-2">
              <Label>Durée</Label>

              <div className="flex gap-2">
                <Input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder="Ex: 5"
                  className="flex-1"
                />

                <Select
                  value={durationUnit || ""}
                  onValueChange={setDurationUnit}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {["jours", "semaines", "mois"].map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Note */}
            <div className="md:col-span-3 space-y-2">
              <Label>Note</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Posologie/Note..."
                  className="flex-1"
                />
                <Button
                  onClick={handleAddMedication}
                  disabled={inputValue.trim() === ""}
                  size="icon"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Number(id) !== 0 && (
        <Card
          className={`border transition-colors ${isPsychotropic ? "border-amber-400 bg-amber-50/10" : "border-border"
            }`}
        >
          <CardContent className="pt-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-full ${isPsychotropic
                  ? "bg-amber-100 text-amber-600"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <Label
                  htmlFor="psychotropic-switch"
                  className="text-base font-medium"
                >
                  Traitement Psychotrope
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activez cette option si l'ordonnance contient des médicaments
                  psychotropes contrôlés.
                </p>
              </div>
            </div>
            <Switch
              id="psychotropic-switch"
              checked={isPsychotropic}
              onCheckedChange={async (checked) => {
                setIsPsychotropic(checked);
                if (checked) {
                  await fetchPsychotropicNumber();
                  if (patient?.address) {
                    setPatientAddress(patient.address);
                  }
                } else {
                  setPsychotropicNumber("");
                }
              }}
            />
          </CardContent>
          {isPsychotropic && (
            <CardContent className="pt-0 border-t border-border/50 mt-4 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Numéro de prescription</Label>
                  <Input
                    value={psychotropicNumber}
                    readOnly
                    className="font-mono bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse du patient</Label>
                  <Input
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
      {/* 3. Selected Medications List */}
      {selectedMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Médicaments Prescrits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedMedications.map((med, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center gap-2">
                      {med.medicineName}
                      {med.dosage && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {med.dosage}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {med.form}
                      {med.quantity && ` • ${med.quantity}`}
                      {med.duration && ` • ${med.duration}`}
                      {med.note && (
                        <span className="text-foreground italic ml-2">
                          — {med.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMedication(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button onClick={onClose} variant="outline" size="lg">
          <X className="w-4 h-4" />
          Annuler
        </Button>
        <PrintButton
          prescription={selectedMedications}
          patient={patient}
          window={window}
          isPsychotropic={isPsychotropic}
          psychotropicNumber={Number(psychotropicNumber)}
          patientAddress={patientAddress}
          disabled={selectedMedications.length === 0}
        />
        {Number(id) !== 0 && (
          <Button
            onClick={handleSave}
            size="lg"
            className="gap-2 min-w-[150px]"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewPrescriptionForm;
