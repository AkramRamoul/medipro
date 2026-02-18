import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Plus,
  Trash2,
  Pill,
  AlertTriangle,
  Save,
  X,
  ClipboardList,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";
import api from "../../axios";

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
  const [duration, setDuration] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [prescriptionDate, setPrescriptionDate] = useState<Date>(new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_SUGGESTIONS = 50;

  const fetchMedications = async () => {
    try {
      const { data: meds } = await api.get('/prescriptions/medications');
      setMedications(meds);
    } catch (err) {
      console.error("Failed to load medications:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/prescriptions/templates');
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates:", err);
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
      prescriptionDate: prescriptionDate.toISOString(),
    };
    try {
      const { data: response } = await api.post('/prescriptions', prescriptionData);
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
      const { data } = await api.get('/prescriptions/next-psychotropic');
      setPsychotropicNumber(data.nextNumber.toString());
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
      duration: duration || null,
      note: note || null,
    };
    setSelectedMedications((prev) => [...prev, medicationWithExtras]);
    setSelectedMedication(null);
    setInputValue("");
    setQuantity("");
    setDuration("");
    setNote("");
  };

  const searchMedications = useCallback(
    (query: string) => {
      if (query.trim() === "") {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }
      const lower = query.toLowerCase();
      const words = lower.split(/\s+/);
      const scored = medications
        .map((med) => {
          const nameLower = med.name.toLowerCase();
          let score = 0;
          if (nameLower === lower) score = 1000;
          else if (nameLower.startsWith(lower)) score = 500;
          else if (words.every((word) => nameLower.includes(word))) score = 100;
          else return null;
          score += Math.max(0, 50 - med.name.length);
          return { med, score };
        })
        .filter(
          (item): item is { med: Medication; score: number } => item !== null,
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS)
        .map((item) => item.med);
      setSuggestions(scored);
      setHighlightedIndex(-1);
      setIsSearching(false);
    },
    [medications],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setSelectedMedication(null);
    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchMedications(value), 300);
  };

  const handleSuggestionClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setInputValue(medication.name);
    setSuggestions([]);
  };

  const handleRemoveMedication = (index: number) => {
    setSelectedMedications((prev) =>
      prev.filter((_, medIndex) => medIndex !== index),
    );
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id.toString() === templateId);
    if (template) {
      const newMeds = template.medications.map((m: any) => ({
        id: 0,
        prescriptionId: 0,
        medicineName: m.medicineName,
        dosage: m.dosage,
        quantity: m.quantity || null,
        form: m.form || "",
        duration: m.duration || null,
        note: m.note || null,
      }));
      setSelectedMedications((prev) => [...prev, ...newMeds]);
      toast.success(`Modèle "${template.name}" appliqué`);
    }
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchMedications();
    fetchTemplates();
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-primary">
                <Pill className="h-6 w-6" />
                Nouvelle Ordonnance
              </CardTitle>
              <CardDescription>
                Recherchez et ajoutez des médicaments pour {patient?.first_name} {patient?.last_name}.
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 justify-start text-left font-normal border-dashed",
                      !isToday(prescriptionDate) &&
                      "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/20",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(prescriptionDate, "PPP", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="flex flex-col">
                    <Calendar
                      mode="single"
                      selected={prescriptionDate}
                      onSelect={(date) => date && setPrescriptionDate(date)}
                      initialFocus
                      locale={fr}
                    />
                    {!isToday(prescriptionDate) && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs h-8"
                          onClick={() => setPrescriptionDate(new Date())}
                        >
                          Revenir à aujourd'hui
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {!isToday(prescriptionDate) && (
                <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  Date modifiée manuellement
                </span>
              )}
            </div>
          </div>
          {templates.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div className="flex-1 text-left">
                <Label className="text-xs font-bold uppercase text-primary/70">
                  Appliquer un modèle
                </Label>
                <Select onValueChange={handleApplyTemplate}>
                  <SelectTrigger className="w-full bg-background mt-1">
                    <SelectValue placeholder="Sélectionner un modèle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-left">
            <div
              ref={containerRef}
              className="md:col-span-4 relative space-y-2"
            >
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
              {(suggestions.length > 0 || isSearching) && (
                <div className="absolute z-50 w-full max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg mt-1 text-left">
                  {isSearching ? (
                    <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                      Recherche...
                    </div>
                  ) : (
                    suggestions.map((med, index) => (
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
                    ))
                  )}
                </div>
              )}
            </div>
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
            <div className="md:col-span-3 space-y-2">
              <Label>Durée</Label>
              <Input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 5 jours..."
                className="w-full"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Note</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Posologie..."
                  className="flex-1"
                />
                <Button
                  onClick={handleAddMedication}
                  disabled={inputValue.trim() === ""}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Number(id) !== 0 && (
        <div
          className={`rounded-lg border transition-all ${isPsychotropic ? "border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50" : "border-border bg-card"}`}
        >
          <div className="p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-full ${isPsychotropic ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <Label
                  htmlFor="psychotropic-switch"
                  className="text-sm font-medium cursor-pointer"
                >
                  Traitement Psychotrope
                </Label>
              </div>
            </div>
            <Switch
              id="psychotropic-switch"
              checked={isPsychotropic}
              onCheckedChange={async (checked) => {
                setIsPsychotropic(checked);
                if (checked) {
                  await fetchPsychotropicNumber();
                  if (patient?.address) setPatientAddress(patient.address);
                } else {
                  setPsychotropicNumber("");
                }
              }}
            />
          </div>
          {isPsychotropic && (
            <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Numéro de série
                  </Label>
                  <Input
                    value={psychotropicNumber}
                    readOnly
                    className="h-8 font-mono bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Adresse du patient
                  </Label>
                  <Input
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    placeholder="Adresse complète"
                    className="h-8 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedMedications.length > 0 && (
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="text-lg">Médicaments Prescrits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedMedications.map((med, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card group hover:bg-accent/50 transition-colors"
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
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
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
          prescriptionDate={prescriptionDate.toISOString()}
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
