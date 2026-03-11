import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Patient } from "../../type";
import PrintButton from "../PrintButton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  Pencil,
  Check,
  GripVertical,
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

type MedItem = import("../../../electron/schema").PrescriptionMed & { uid: string };

// ─── Sortable medication row ───────────────────────────────────────────────
const SortableMedItem = memo(function SortableMedItem({
  med,
  index,
  editingIndex,
  onEdit,
  onRemove,
}: {
  med: MedItem;
  index: number;
  editingIndex: number | null;
  onEdit: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: med.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isEditing = editingIndex === index;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors group ${isEditing
        ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
        : "bg-card hover:bg-accent/50 border-border"
        } ${isDragging ? "shadow-lg" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none p-0.5 rounded"
        tabIndex={-1}
        aria-label="Réorganiser"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="space-y-1 flex-1 min-w-0">
        <div className="font-semibold flex items-center gap-2">
          {isEditing && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Pencil className="h-3 w-3" />
            </span>
          )}
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
            <span className="text-foreground italic ml-2">— {med.note}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => onEdit(index)}
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(index)}
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

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
  const [selectedMedications, setSelectedMedications] = useState<MedItem[]>([]);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [quantity, setQuantity] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [prescriptionDate, setPrescriptionDate] = useState<Date>(new Date());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Template Save State
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
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
    const medicationWithExtras: MedItem = {
      uid:
        editingIndex !== null
          ? selectedMedications[editingIndex].uid
          : crypto.randomUUID(),
      id: selectedMedication?.id || 0,
      prescriptionId: 0,
      medicineName: medName,
      dosage: selectedMedication?.dosage || "",
      quantity: quantity || null,
      form: selectedMedication?.form || "",
      duration: duration || null,
      note: note || null,
    };
    if (editingIndex !== null) {
      setSelectedMedications((prev) =>
        prev.map((m, i) => (i === editingIndex ? medicationWithExtras : m)),
      );
      setEditingIndex(null);
    } else {
      setSelectedMedications((prev) => [...prev, medicationWithExtras]);
    }
    setSelectedMedication(null);
    setInputValue("");
    setQuantity("");
    setDuration("");
    setNote("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSelectedMedications((items) => {
      const oldIndex = items.findIndex((m) => m.uid === active.id);
      const newIndex = items.findIndex((m) => m.uid === over.id);
      // Keep editingIndex in sync after reorder
      if (editingIndex !== null) {
        if (editingIndex === oldIndex) setEditingIndex(newIndex);
        else if (oldIndex < editingIndex && newIndex >= editingIndex)
          setEditingIndex((i) => i! - 1);
        else if (oldIndex > editingIndex && newIndex <= editingIndex)
          setEditingIndex((i) => i! + 1);
      }
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleEditMedication = useCallback((index: number) => {
    const med = selectedMedications[index];
    setEditingIndex(index);
    setInputValue(med.medicineName);
    setQuantity(med.quantity || "");
    setDuration(med.duration || "");
    setNote(med.note || "");
    // Try to match against the medications list for dosage/form
    const match = medications.find(
      (m) => m.name.toLowerCase() === med.medicineName.toLowerCase(),
    );
    setSelectedMedication(
      match
        ? match
        : {
          name: med.medicineName,
          form: med.form || "",
          dosage: med.dosage || "",
        },
    );
    setSuggestions([]);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedMedications, medications]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setSelectedMedication(null);
    setInputValue("");
    setQuantity("");
    setDuration("");
    setNote("");
    setSuggestions([]);
  }, []);

  const searchMedications = useCallback(
    (query: string) => {
      if (query.trim() === "") {
        setSuggestions([]);
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
    },
    [medications],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setSelectedMedication(null);
    searchMedications(value);
  };

  const handleSuggestionClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setInputValue(medication.name);
    setSuggestions([]);
  };

  const handleRemoveMedication = useCallback((index: number) => {
    setSelectedMedications((prev) =>
      prev.filter((_, medIndex) => medIndex !== index),
    );
  }, []);

  const handleRemoveMedItem = useCallback((index: number) => {
    if (editingIndex === index) {
      handleCancelEdit();
    }
    handleRemoveMedication(index);
  }, [editingIndex, handleCancelEdit, handleRemoveMedication]);

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id.toString() === templateId);
    if (template) {
      const newMeds: MedItem[] = template.medications.map((m: any) => ({
        uid: crypto.randomUUID(),
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

  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Le nom du modèle est requis");
      return;
    }
    if (selectedMedications.length === 0) {
      toast.error("Ajoutez au moins un médicament au modèle");
      return;
    }

    try {
      // Map back to the DTO expected by the backend
      const templateMedications = selectedMedications.map(med => ({
        medicineName: med.medicineName,
        dosage: med.dosage,
        form: med.form,
        quantity: med.quantity,
        duration: med.duration,
        note: med.note
      }));

      const { data: result } = await api.post('/prescriptions/templates', {
        name: newTemplateName.trim(),
        medications: templateMedications,
      });

      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        setIsTemplateDialogOpen(false);
        setNewTemplateName("");
        fetchTemplates(); // Refresh the dropdown
      } else {
        toast.error("Erreur lors de l'enregistrement du modèle");
      }
    } catch (error) {
      console.error("Save template error:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
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
    Promise.all([fetchMedications(), fetchTemplates()]);
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
          {editingIndex !== null && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/30 text-sm text-primary font-medium">
              <Pencil className="h-3.5 w-3.5" />
              Modification du médicament n°{editingIndex + 1}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleCancelEdit}
              >
                <X className="h-3 w-3 mr-1" />
                Annuler
              </Button>
            </div>
          )}
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
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg mt-1 text-left">
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
              <div className="flex justify-between items-center">
                <Label>Durée</Label>
                <div className="flex gap-1">
                  {["3j", "5j", "7j", "10j", "1 mois"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDuration(preset)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
                      tabIndex={-1}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 5 jours..."
                className="w-full"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <div className="flex justify-between items-center">
                <Label>Note</Label>
                <div className="flex gap-1">
                  {["1×/j", "2×/j", "3×/j"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNote((prev) => prev ? `${prev}, ${preset}` : preset)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
                      tabIndex={-1}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Posologie..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim() !== "") {
                      handleAddMedication();
                    }
                  }}
                />
                <Button
                  onClick={handleAddMedication}
                  disabled={inputValue.trim() === ""}
                  size="icon"
                  variant={editingIndex !== null ? "default" : "default"}
                  title={editingIndex !== null ? "Confirmer la modification" : "Ajouter"}
                >
                  {editingIndex !== null ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
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
            <CardTitle className="text-lg flex items-center gap-2">
              Médicaments Prescrits
              {selectedMedications.length > 1 && (
                <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <GripVertical className="h-3.5 w-3.5" />
                  Glissez pour réorganiser
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedMedications.map((m) => m.uid)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {selectedMedications.map((med, index) => (
                    <SortableMedItem
                      key={med.uid}
                      med={med}
                      index={index}
                      editingIndex={editingIndex}
                      onEdit={handleEditMedication}
                      onRemove={handleRemoveMedItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button onClick={onClose} variant="ghost" size="lg">
          <X className="w-4 h-4" />
          Annuler
        </Button>
        {selectedMedications.length > 0 && (
          <Button
            onClick={() => setIsTemplateDialogOpen(true)}
            variant="outline"
            size="lg"
            className="flex-1 max-w-[200px]"
          >
            <Save className="w-4 h-4 text-muted-foreground mr-1" />
            Sauvegarder modèle
          </Button>
        )}
        <PrintButton
          prescription={selectedMedications}
          patient={patient}
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
            disabled={selectedMedications.length === 0}
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        )}
      </div>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enregistrer comme modèle</DialogTitle>
            <DialogDescription>
              Ce modèle contiendra les {selectedMedications.length} médicament(s) actuellement sélectionnés.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nom du modèle</Label>
              <Input
                id="template-name"
                placeholder="Ex: Traitement grippe"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAsTemplate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveAsTemplate}>
              Enregistrer le modèle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewPrescriptionForm;
