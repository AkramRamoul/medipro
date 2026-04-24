import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Trash2, Plus, Save, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import api from "../../axios";

interface Medication {
  id?: number;
  name: string;
  brandName?: string;
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

  // Form state for new/edit template
  const [templateName, setTemplateName] = useState("");
  const [selectedMeds, setSelectedMeds] = useState<TemplateMedication[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Medication search state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [dosage, setDosage] = useState("");
  const [form, setForm] = useState("");
  const [quantity, setQuantity] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);

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
          const brandLower = (med.brandName || "").toLowerCase();
          let score = 0;
          // Match on generic name (DCI)
          if (nameLower === lower) score = 1000;
          else if (nameLower.startsWith(lower)) score = 500;
          else if (words.every((word) => nameLower.includes(word))) score = 100;
          // Match on brand name (NOM DE MARQUE)
          else if (brandLower === lower) score = 950;
          else if (brandLower.startsWith(lower)) score = 450;
          else if (words.every((word) => brandLower.includes(word))) score = 90;
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
    setInputValue(med.brandName || med.name);
    setDosage(med.dosage || "");
    setForm(med.form || "");
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
      dosage: dosage.trim(),
      form: form.trim(),
      quantity: quantity || undefined,
      duration: duration || undefined,
      note: note || undefined,
    };

    if (editingMedIndex !== null) {
      const updated = [...selectedMeds];
      updated[editingMedIndex] = newMed;
      setSelectedMeds(updated);
      setEditingMedIndex(null);
    } else {
      setSelectedMeds([...selectedMeds, newMed]);
    }

    setInputValue("");
    setSelectedMed(null);
    setDosage("");
    setForm("");
    setQuantity("");
    setDuration("");
    setNote("");
  };

  const handleEditMedFromTemplate = (index: number) => {
    const med = selectedMeds[index];
    setInputValue(med.medicineName);
    setDosage(med.dosage || "");
    setForm(med.form || "");
    setQuantity(med.quantity || "");
    setDuration(med.duration || "");
    setNote(med.note || "");
    setEditingMedIndex(index);
    
    const match = medications.find(
      (m) =>
        m.name.toLowerCase() === med.medicineName.toLowerCase() ||
        (m.brandName && m.brandName.toLowerCase() === med.medicineName.toLowerCase())
    );
    setSelectedMed(match || null);
    setSuggestions([]);
  };

  const handleCancelMedEdit = () => {
    setEditingMedIndex(null);
    setInputValue("");
    setSelectedMed(null);
    setDosage("");
    setForm("");
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
      if (editingTemplateId) {
        const { data: result } = await api.put(`/prescriptions/templates/${editingTemplateId}`, {
          name: templateName,
          medications: selectedMeds,
        });
        if (result.success) {
          toast.success("Modèle modifié avec succès");
          setTemplateName("");
          setSelectedMeds([]);
          setEditingTemplateId(null);
          fetchTemplates();
        } else {
          toast.error("Erreur lors de la modification");
        }
      } else {
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
      }
    } catch (error) {
      console.error("Save template error:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleEditTemplate = (template: PrescriptionTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setSelectedMeds([...template.medications]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setTemplateName("");
    setSelectedMeds([]);
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
    if (editingMedIndex === index) {
      handleCancelMedEdit();
    }
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
        {/* Creation / Edit Form */}
        <div className="space-y-4 border p-4 rounded-md bg-muted/30">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">
              {editingTemplateId ? "Modifier le modèle" : "Nouveau modèle"}
            </h4>
            {editingTemplateId && (
               <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-muted-foreground h-6 px-2 text-xs">
                 Annuler
               </Button>
            )}
          </div>
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
                      <div className="font-medium">{med.brandName || med.name}</div>
                      {med.brandName && med.brandName.toLowerCase() !== med.name.toLowerCase() && (
                        <div className="text-xs text-primary/70">{med.name}</div>
                      )}
                      {med.dosage && (
                        <div className="text-xs text-muted-foreground">{med.dosage}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Forme</Label>
                <Input
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  placeholder="Ex: Comprimé"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dosage</Label>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Ex: 500mg"
                />
              </div>
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
              <div className="flex justify-between items-center">
                <Label className="text-xs">Note/Posologie</Label>
                {editingMedIndex !== null && (
                  <Button variant="ghost" size="sm" className="h-4 text-[10px] px-0" onClick={handleCancelMedEdit}>
                    <X className="h-3 w-3 mr-1" />
                    Annuler l'édition
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Matin-Soir..."
                />
                <Button variant={editingMedIndex !== null ? "default" : "default"} size="icon" onClick={handleAddMedToTemplate}>
                  {editingMedIndex !== null ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
                    className={`flex justify-between items-center text-xs p-1 border-b last:border-0 ${editingMedIndex === i ? 'bg-primary/5 rounded' : ''}`}
                  >
                    <span className="flex gap-2">
                      <span className="font-medium">{med.medicineName}</span>
                      <span className="text-muted-foreground">{med.dosage} {med.form}</span>
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-5 w-5 ${editingMedIndex === i ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={() => handleEditMedFromTemplate(i)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:bg-destructive/10"
                        onClick={() => removeMedFromTemplate(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button className="w-full text-white" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" /> {editingTemplateId ? "Enregistrer les modifications" : "Enregistrer le modèle"}
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
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
