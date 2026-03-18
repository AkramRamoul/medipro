import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Trash2, Plus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
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

interface TemplateMedication {
  medicineName: string;
  dosage: string;
  duration?: string;
  quantity?: string;
  form?: string;
  note?: string;
}

interface PrescriptionTemplate {
  id: number;
  name: string;
  medications: TemplateMedication[];
}

const PrescriptionTemplatesSettings: React.FC = () => {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for new template
  const [templateName, setTemplateName] = useState("");
  const [selectedMeds, setSelectedMeds] = useState<TemplateMedication[]>([]);

  // Medication search state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [quantity, setQuantity] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_SUGGESTIONS = 50;

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/prescriptions/templates');
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Erreur lors du chargement des modèles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const { data: meds } = await api.get('/prescriptions/medications');
      setMedications(meds);
    } catch (err) {
      console.error("Failed to load medications:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchMedications();
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
    },
    [medications],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedMed(null);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchMedications(value), 300);
  };

  const handleSuggestionClick = (med: Medication) => {
    setSelectedMed(med);
    setInputValue(med.name);
    setSuggestions([]);
  };

  const handleAddMedToTemplate = () => {
    const medName = selectedMed ? selectedMed.name : inputValue.trim();
    if (!medName) {
      toast.error("Le nom du médicament est requis");
      return;
    }

    const newMed: TemplateMedication = {
      medicineName: medName,
      dosage: selectedMed?.dosage || "",
      form: selectedMed?.form || "",
      quantity: quantity || undefined,
      duration: duration || undefined,
      note: note || undefined,
    };

    setSelectedMeds([...selectedMeds, newMed]);
    setInputValue("");
    setSelectedMed(null);
    setQuantity("");
    setDuration("");
    setNote("");
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Le nom du modèle est requis");
      return;
    }
    if (selectedMeds.length === 0) {
      toast.error("Ajoutez au moins un médicament au modèle");
      return;
    }

    try {
      const { data: result } = await api.post('/prescriptions/templates', {
        name: templateName,
        medications: selectedMeds,
      });
      if (result.success) {
        toast.success("Modèle enregistré avec succès");
        setTemplateName("");
        setSelectedMeds([]);
        fetchTemplates();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Save template error:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const { data: result } = await api.delete(`/prescriptions/templates/${id}`);
      if (result.success) {
        toast.success("Modèle supprimé");
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const removeMedFromTemplate = (index: number) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Modèles d'ordonnance</h3>
        <p className="text-sm text-muted-foreground">
          Créez des modèles d'ordonnance pour gagner du temps lors des
          prescriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creation Form */}
        <div className="space-y-4 border p-4 rounded-md bg-muted/30">
          <h4 className="font-semibold text-sm">Nouveau modèle</h4>
          <div className="space-y-2">
            <Label>Nom du modèle</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Traitement grippe"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="relative">
              <Label>Ajouter un médicament</Label>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Nom du médicament..."
              />
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full max-h-40 overflow-y-auto bg-popover border border-border rounded-md shadow-lg mt-1">
                  {suggestions.map((med, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSuggestionClick(med)}
                    >
                      {med.name} - {med.dosage}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Quantité</Label>
                <Input
                  size={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1 bte"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Durée</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5 jours"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Note/Posologie</Label>
              <div className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Matin-Soir..."
                />
                <Button size="icon" onClick={handleAddMedToTemplate}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase text-muted-foreground">
              Médicaments dans le modèle :
            </h5>
            <div className="max-h-40 overflow-y-auto border rounded bg-background p-2 space-y-1">
              {selectedMeds.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  Aucun médicament ajouté.
                </p>
              ) : (
                selectedMeds.map((med, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs p-1 border-b last:border-0"
                  >
                    <span>
                      {med.medicineName} {med.dosage}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-destructive"
                      onClick={() => removeMedFromTemplate(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button className="w-full text-white" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" /> Enregistrer le modèle
          </Button>
        </div>

        {/* Existing Templates */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Modèles existants</h4>
          {isLoading ? (
            <p className="text-sm">Chargement...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Aucun modèle configuré.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="relative group">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex justify-between">
                      {template.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {template.medications.map((med, idx) => (
                        <li key={idx}>• {med.medicineName}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTemplatesSettings;
