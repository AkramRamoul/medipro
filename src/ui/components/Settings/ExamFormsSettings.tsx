import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  AlignLeft, 
  Hash, 
  Calendar, 
  List, 
  CheckSquare, 
  Circle, 
  Heading, 
  SeparatorHorizontal,
  Save,
  Loader2,
  X
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { toast } from "sonner";
import api from "../../axios";

type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "radio" | "header" | "divider";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  width?: "full" | "half";
}

interface ExamForm {
  id?: number;
  name: string;
  specialty: string;
  fields: FormField[];
  isDefault: boolean;
}

const FIELD_PALETTE: { type: FieldType; label: string; icon: any }[] = [
  { type: "text", label: "Texte court", icon: Type },
  { type: "textarea", label: "Texte long", icon: AlignLeft },
  { type: "number", label: "Nombre", icon: Hash },
  { type: "date", label: "Date", icon: Calendar },
  { type: "select", label: "Sélection", icon: List },
  { type: "checkbox", label: "Case à cocher", icon: CheckSquare },
  { type: "radio", label: "Bouton radio", icon: Circle },
  { type: "header", label: "En-tête", icon: Heading },
  { type: "divider", label: "Séparateur", icon: SeparatorHorizontal },
];

const SPECIALTIES = [
  "Médecine Générale",
  "Cardiologie",
  "Pneumologie",
  "Neurologie",
  "Pédiatrie",
  "Gynécologie",
  "Orthopédie",
  "Dermatologie",
  "Ophtalmologie",
  "Autre"
];

const ExamFormsSettings: React.FC = () => {
  const [forms, setForms] = useState<ExamForm[]>([]);
  const [currentForm, setCurrentForm] = useState<ExamForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/consultations/exam-forms");
      setForms(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des formulaires");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreateNew = () => {
    setCurrentForm({
      name: "",
      specialty: "Médecine Générale",
      fields: [],
      isDefault: false,
    });
  };

  const handleEdit = (form: ExamForm) => {
    setCurrentForm({ ...form });
  };

  const handleAddField = (type: FieldType) => {
    if (!currentForm) return;
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === "header" ? "Nouvel En-tête" : "Nouveau champ",
      placeholder: "",
      options: (type === "select" || type === "checkbox" || type === "radio") ? ["Option 1"] : [],
      required: false,
      width: "full",
    };
    setCurrentForm({
      ...currentForm,
      fields: [...currentForm.fields, newField],
    });
  };

  const handleRemoveField = (id: string) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter((f) => f.id !== id),
    });
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const handleAddOption = (fieldId: string) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.map((f) => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
        }
        return f;
      }),
    });
  };

  const handleUpdateOption = (fieldId: string, optionIndex: number, value: string) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOptions = [...f.options];
          newOptions[optionIndex] = value;
          return { ...f, options: newOptions };
        }
        return f;
      }),
    });
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    if (!currentForm) return;
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.map((f) => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: f.options.filter((_, i) => i !== optionIndex) };
        }
        return f;
      }),
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    if (!currentForm) return;
    const items = [...currentForm.fields];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setCurrentForm({ ...currentForm, fields: items });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (!currentForm) return;
    if (!currentForm.name.trim()) {
      toast.error("Le nom du formulaire est requis");
      return;
    }

    setIsSaving(true);
    try {
      if (currentForm.id) {
        await api.put(`/consultations/exam-forms/${currentForm.id}`, currentForm);
        toast.success("Formulaire mis à jour");
      } else {
        await api.post("/consultations/exam-forms", currentForm);
        toast.success("Formulaire créé");
      }
      setCurrentForm(null);
      fetchForms();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ?")) return;
    try {
      await api.delete(`/consultations/exam-forms/${id}`);
      toast.success("Formulaire supprimé");
      fetchForms();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Formulaires d'examen personnalisés</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Créez des formulaires d'examen structurés adaptés à vos spécialités.
          </p>
        </div>
        {!currentForm && (
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" /> Nouveau formulaire
          </Button>
        )}
      </div>

      {!currentForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : forms.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed rounded-lg bg-muted/10">
              <p className="text-muted-foreground italic">Aucun formulaire d'examen configuré.</p>
            </div>
          ) : (
            forms.map((form) => (
              <div 
                key={form.id} 
                className="group p-4 border rounded-lg bg-background hover:border-primary transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="mb-2 text-[10px] uppercase">
                      {form.specialty}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-destructive" 
                        onClick={() => handleDeleteModel(form.id!)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg">{form.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.fields.length} champ{form.fields.length > 1 ? "s" : ""}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-4 w-full text-xs"
                  onClick={() => handleEdit(form)}
                >
                  Modifier le formulaire
                </Button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6 pt-4 border-t">
          {/* Form Properties & Palette - Sticky Toolbox Header */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b space-y-4">
            {/* Row 1: Form Properties */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-widest">Nom du formulaire</Label>
                <Input 
                  value={currentForm.name}
                  onChange={(e) => setCurrentForm({...currentForm, name: e.target.value})}
                  placeholder="ex: Examen Cardiologique"
                  className="bg-background shadow-sm h-10"
                />
              </div>
              <div className="w-full md:w-64 space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-widest">Spécialité</Label>
                <Select 
                  value={currentForm.specialty}
                  onValueChange={(val) => setCurrentForm({...currentForm, specialty: val})}
                >
                  <SelectTrigger className="bg-background shadow-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="h-10 px-6 gap-2 shadow-lg shadow-primary/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Enregistrer</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentForm(null)}
                className="h-10 w-10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Row 2: Field Palette Toolbox */}
            <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-primary/20">
              <div className="flex items-center gap-3 mb-2 px-1">
                <div className="p-1 rounded bg-primary/10">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </div>
                <Label className="text-[10px] uppercase font-black text-primary tracking-widest">Boîte à outils (Ajouter des champs)</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {FIELD_PALETTE.map((item) => (
                  <Button
                    key={item.type}
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs px-3 gap-2 bg-background hover:bg-primary/5 hover:text-primary transition-all border-muted hover:border-primary/50 shadow-sm"
                    onClick={() => handleAddField(item.type)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Builder Canvas */}
          <div className="space-y-4 bg-muted/5 p-4 md:p-6 rounded-xl border-2 border-dashed border-border/50 min-h-[600px] w-full">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-primary uppercase tracking-wider px-2">Aperçu du Formulaire</h4>
              {currentForm.fields.length > 0 && (
                 <p className="text-[10px] text-muted-foreground italic">Glissez-déposez pour réordonner</p>
              )}
            </div>

            {currentForm.fields.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                <Plus className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Votre formulaire est vide. Cliquez sur les éléments de la palette ci-dessus pour commencer à construire.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentForm.fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      relative p-3 md:p-4 border rounded-lg bg-card shadow-sm transition-all
                      ${draggedIndex === index ? "opacity-40 scale-95" : "opacity-100 scale-100"}
                      hover:ring-1 hover:ring-primary/50 group
                    `}
                  >
                    <div className="flex gap-3 md:gap-4 items-start">
                      <div className="cursor-grab text-muted-foreground/30 hover:text-primary transition-colors mt-2">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between gap-4">
                           {field.type !== "divider" ? (
                             <Input 
                               value={field.label}
                               onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                               className={`
                                 border-none p-0 focus-visible:ring-0 shadow-none font-semibold text-lg hover:bg-muted/30 px-2 rounded
                                 ${field.type === "header" ? "text-primary text-xl" : ""}
                               `}
                             />
                           ) : (
                             <div className="border-b w-full flex-1" />
                           )}
                           
                           <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="text-[10px] h-5 uppercase px-1.5 font-normal">
                               {FIELD_PALETTE.find(p => p.type === field.type)?.label}
                             </Badge>
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-8 w-8 text-destructive opacity-40 hover:opacity-100" 
                               onClick={() => handleRemoveField(field.id)}
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                        </div>

                        {field.type !== "header" && field.type !== "divider" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase text-muted-foreground ml-1">Placeholder / Aide</Label>
                              <Input 
                                value={field.placeholder}
                                onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                placeholder="Texte d'aide..."
                                className="h-8 text-sm bg-muted/20"
                              />
                            </div>
                            <div className="flex items-center gap-6 self-end pb-2">
                              <div className="flex items-center gap-2">
                                <Switch 
                                  id={`req-${field.id}`}
                                  checked={field.required}
                                  onCheckedChange={(val) => handleUpdateField(field.id, { required: val })}
                                />
                                <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">Obligatoire</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch 
                                  id={`width-${field.id}`}
                                  checked={field.width === "half"}
                                  onCheckedChange={(val) => handleUpdateField(field.id, { width: val ? "half" : "full" })}
                                />
                                <Label htmlFor={`width-${field.id}`} className="text-xs cursor-pointer">Demi-largeur</Label>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Options editor for Select/Radio/Checkbox */}
                        {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                          <div className="space-y-2 pt-2 border-t mt-4">
                            <Label className="text-[10px] uppercase text-muted-foreground ml-1">Options</Label>
                            <div className="flex flex-wrap gap-2">
                              {field.options?.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2 bg-muted/20 pl-2 pr-1 py-1 rounded-md border text-sm group/opt">
                                  <input 
                                    value={opt}
                                    onChange={(e) => handleUpdateOption(field.id, optIdx, e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 p-0 w-24"
                                  />
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-5 w-5 text-destructive/50 hover:text-destructive group-hover/opt:opacity-100"
                                    onClick={() => handleRemoveOption(field.id, optIdx)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-3 text-xs border-dashed"
                                onClick={() => handleAddOption(field.id)}
                              >
                                <Plus className="w-3 h-3 mr-1.5" /> Ajouter une option
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 justify-end pt-8 border-t mt-8">
              <Button variant="outline" onClick={() => setCurrentForm(null)} className="gap-2">
                <X className="w-4 h-4" /> Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[140px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamFormsSettings;
