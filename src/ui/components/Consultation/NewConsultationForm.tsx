import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Heart,
  Loader2,
  Stethoscope,
  Weight,
  Thermometer,
  FileText,
  AlertCircle,
  ClipboardList,
  Save,
  X,
  Banknote,
  Check,
  ArrowLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Patient } from "../../type";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import api from "../../axios";
import NewPrescriptionForm from "../Prescription/NewPrescriptionForm";
import { BloodWork } from "../Documents/BloodWork";

function NewConsultationForm({
  id,
  onClose,
  refreshConsultations,
}: {
  id: string;
  onClose: () => void;
  refreshConsultations: () => void;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingConsultationId, setExistingConsultationId] = useState<number | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [linkedAppointmentId, setLinkedAppointmentId] = useState<number | null>(null);
  const [savedConsultationId, setSavedConsultationId] = useState<number | null>(null);

  const [examFormTemplates, setExamFormTemplates] = useState<any[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("none");
  const [examFormData, setExamFormData] = useState<Record<string, any>>({});

  const [allDiagnostics, setAllDiagnostics] = useState<{ name: string }[]>([]);
  const [diagnosticSuggestions, setDiagnosticSuggestions] = useState<
    { name: string }[]
  >([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    api.get(`/patients/${id}`)
      .then(({ data }) => {
        setPatient(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get('/consultations/exam-forms')
      .then(({ data }) => {
        setExamFormTemplates(data);
      })
      .catch(console.error);

    // Check for existing in-progress consultation for today
    api.get(`/consultations/patient/${id}`)
      .then(({ data: consultations }: { data: any[] }) => {
        const today = new Date().toISOString().split('T')[0];
        const inProgress = consultations.find(c =>
          c.status === 'in_progress' &&
          c.date.startsWith(today)
        );

        if (inProgress) {
          setExistingConsultationId(inProgress.id);
          setIsResuming(true);
          setLinkedAppointmentId(inProgress.appointmentId);
          if (inProgress.reason) setReason(inProgress.reason);
        }
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    api.get("/consultations/diagnostics/common")
      .then(({ data }) => setAllDiagnostics(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setDiagnosticSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDiagnosticChange(value: string) {
    setDiagnosis(value);
    if (!value.trim()) {
      setDiagnosticSuggestions([]);
      return;
    }
    const filtered = allDiagnostics
      .filter((d) => d.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 8);
    setDiagnosticSuggestions(filtered);
    setHighlightedIndex(-1);
  }

  function handleDiagnosticKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // If not showing suggestions, don't trap enter
    if (diagnosticSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, diagnosticSuggestions.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      setDiagnosis(diagnosticSuggestions[highlightedIndex].name);
      setDiagnosticSuggestions([]);
      setHighlightedIndex(-1);
    } else if (e.key === "Escape") {
      setDiagnosticSuggestions([]);
    }
  }

  function selectDiagnosticSuggestion(name: string) {
    setDiagnosis(name);
    setDiagnosticSuggestions([]);
    setHighlightedIndex(-1);
  }

  const handleSave = async () => {
    if (!patient) return;

    const consultationData = {
      patientId: Number(id),
      reason,
      symptoms,
      diagnosis,
      notes,
      vitals: {
        bpSystolic: bpSystolic ? bpSystolic : null,
        bpDiastolic: bpDiastolic ? bpDiastolic : null,
        glucose: glucose ? glucose : null,
        weight: weight ? weight : null,
        temperature: temperature ? temperature : null,
      },
      amountPaid: amountPaid ? Math.round(Number(amountPaid)) : null,
      formId: selectedFormId !== "none" ? Number(selectedFormId) : null,
      formData: examFormData,
      status: "completed",
      appointmentId: linkedAppointmentId
    };

    try {
      let createdId = existingConsultationId;
      if (existingConsultationId) {
        await api.put(`/consultations/${existingConsultationId}`, consultationData);
      } else {
        const res = await api.post('/consultations', consultationData);
        if (res.data && res.data.id) {
          createdId = res.data.id;
        }
      }
      if (createdId) {
        setSavedConsultationId(createdId);
      }
      toast.success("Consultation enregistrée avec succès !");
      refreshConsultations();
      window.dispatchEvent(
        new CustomEvent("patient-vitals-updated", {
          detail: { patientId: Number(id) },
        }),
      );
      window.dispatchEvent(new Event("consultations-updated"));
      // We don't automatically close so the user can use the right side panels
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'enregistrement de la consultation");
    }
  };

  const ensureConsultationSaved = async (): Promise<number> => {
    const activeId = savedConsultationId || existingConsultationId;
    if (activeId) return activeId;

    const consultationData = {
      patientId: Number(id),
      reason: reason || "Consultation en cours",
      symptoms,
      diagnosis,
      notes,
      vitals: {
        bpSystolic: bpSystolic ? bpSystolic : null,
        bpDiastolic: bpDiastolic ? bpDiastolic : null,
        glucose: glucose ? glucose : null,
        weight: weight ? weight : null,
        temperature: temperature ? temperature : null,
      },
      amountPaid: amountPaid ? Math.round(Number(amountPaid)) : null,
      formId: selectedFormId !== "none" ? Number(selectedFormId) : null,
      formData: examFormData,
      status: "in_progress",
      appointmentId: linkedAppointmentId
    };

    try {
      const res = await api.post('/consultations', consultationData);
      const createdId = res.data?.id;
      if (createdId) {
        setSavedConsultationId(createdId);
        refreshConsultations();
        window.dispatchEvent(
          new CustomEvent("patient-vitals-updated", {
            detail: { patientId: Number(id) },
          }),
        );
        window.dispatchEvent(new Event("consultations-updated"));
        return createdId;
      }
      throw new Error("Failed to get id from consultation creation response");
    } catch (error) {
      console.error("Auto-save consultation failed:", error);
      toast.error("Échec de la liaison avec la consultation");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeConsultationId = savedConsultationId || existingConsultationId;

  return (
    <div className="w-full max-w-full mx-auto h-[88vh] flex flex-col bg-background/50">
      <div className="flex-none pb-4 border-b flex justify-between items-center px-4 pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-primary">
              <Stethoscope className="w-8 h-8" />
              {isResuming ? "Terminer la Consultation" : "Nouvelle Consultation"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {patient?.first_name} {patient?.last_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            {savedConsultationId ? "Fermer" : "Annuler"}
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 min-w-[150px]"
          >
            <Save className="w-4 h-4" />
            {savedConsultationId || existingConsultationId ? "Mettre à jour" : "Enregistrer la consultation"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        {/* LEFT COLUMN: Consultation Info */}
        <div className="overflow-y-auto pr-2 space-y-6 pb-20 custom-scrollbar relative">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      Motif de Consultation
                    </Label>
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ex: Douleurs abdominales, Fièvre..."
                      className="bg-muted/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      Symptômes
                    </Label>
                    <Textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Description détaillée des symptômes..."
                      className="min-h-[120px] bg-muted/30 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 relative" ref={suggestionsRef}>
                    <Label className="flex items-center gap-2 text-foreground font-medium">
                      <Activity className="w-4 h-4 text-blue-500" />
                      Diagnostic
                    </Label>
                    <div className="relative">
                      <Input
                        value={diagnosis}
                        onChange={(e) => handleDiagnosticChange(e.target.value)}
                        onKeyDown={handleDiagnosticKeyDown}
                        onFocus={() => {
                          if (diagnosis) handleDiagnosticChange(diagnosis);
                        }}
                        placeholder="Rechercher un diagnostic..."
                        className="bg-muted/30"
                        autoComplete="off"
                      />
                      {diagnosticSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full bg-popover text-popover-foreground text-left border rounded-lg shadow-lg mt-2 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                          <div className="p-1.5">
                            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">
                              Suggestions
                            </div>
                            {diagnosticSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.preventDefault();
                                  selectDiagnosticSuggestion(suggestion.name);
                                }}
                                className={`w-full text-left px-2 py-2 text-sm rounded-md flex items-center justify-between group ${index === highlightedIndex
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground"
                                  }`}
                              >
                                <span>{suggestion.name}</span>
                                <Check
                                  className={`w-4 h-4 opacity-0 ${index === highlightedIndex
                                    ? "opacity-100"
                                    : "group-hover:opacity-100"
                                    }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium">
                      <FileText className="w-4 h-4 text-primary" />
                      Notes Complémentaires
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Examens cliniques, observations spécifiques..."
                      className="min-h-[120px] bg-muted/30 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Formulaire Supplémentaire */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <FileText className="w-5 h-5" />
                    Formulaire d'examen spécifique
                  </h3>
                  <div className="w-full md:w-72">
                    <Select
                      value={selectedFormId}
                      onValueChange={(val) => {
                        setSelectedFormId(val);
                        const template = examFormTemplates.find(t => t.id.toString() === val);
                        if (template) {
                          const newData = { ...examFormData };
                          template.fields.forEach((f: any) => {
                            if (newData[f.id] === undefined) {
                              newData[f.id] = (f.type === "checkbox") ? [] : "";
                            }
                          });
                          setExamFormData(newData);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue placeholder="Choisir un formulaire..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun (Standard)</SelectItem>
                        {examFormTemplates.map((form) => (
                          <SelectItem key={form.id} value={form.id.toString()}>
                            {form.name} ({form.specialty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedFormId !== "none" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 bg-muted/10 rounded-xl border border-border/50">
                    {examFormTemplates.find(t => t.id.toString() === selectedFormId)?.fields.map((field: any) => {
                      const isFullWidth = field.width === "full" || field.type === "header" || field.type === "divider" || field.type === "textarea";

                      if (field.type === "header") {
                        return (
                          <div key={field.id} className="col-span-full mt-4 mb-2">
                            <h4 className="text-md font-bold text-primary border-b pb-1 uppercase tracking-tight">{field.label}</h4>
                          </div>
                        );
                      }

                      if (field.type === "divider") {
                        return (
                          <div key={field.id} className="col-span-full my-2 border-b border-border/50" />
                        );
                      }

                      return (
                        <div key={field.id} className={`${isFullWidth ? "col-span-full" : "col-span-1"} space-y-2`}>
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            {field.label}
                            {field.required && <span className="text-destructive">*</span>}
                          </Label>

                          {field.type === "text" && (
                            <Input
                              placeholder={field.placeholder}
                              value={examFormData[field.id] || ""}
                              onChange={(e) => setExamFormData({ ...examFormData, [field.id]: e.target.value })}
                              className="bg-background"
                            />
                          )}

                          {field.type === "textarea" && (
                            <Textarea
                              placeholder={field.placeholder}
                              value={examFormData[field.id] || ""}
                              onChange={(e) => setExamFormData({ ...examFormData, [field.id]: e.target.value })}
                              className="bg-background min-h-[100px]"
                            />
                          )}

                          {field.type === "number" && (
                            <Input
                              type="number"
                              placeholder={field.placeholder}
                              value={examFormData[field.id] || ""}
                              onChange={(e) => setExamFormData({ ...examFormData, [field.id]: e.target.value })}
                              className="bg-background"
                            />
                          )}

                          {field.type === "date" && (
                            <Input
                              type="date"
                              value={examFormData[field.id] || ""}
                              onChange={(e) => setExamFormData({ ...examFormData, [field.id]: e.target.value })}
                              className="bg-background"
                            />
                          )}

                          {field.type === "select" && (
                            <Select
                              value={examFormData[field.id] || ""}
                              onValueChange={(val) => setExamFormData({ ...examFormData, [field.id]: val })}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder={field.placeholder || "Sélectionnez..."} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt: string) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {field.type === "radio" && (
                            <RadioGroup
                              value={examFormData[field.id] || ""}
                              onValueChange={(val) => setExamFormData({ ...examFormData, [field.id]: val })}
                              className="flex flex-wrap gap-4 pt-1"
                            >
                              {field.options?.map((opt: string) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opt} id={`radio-${field.id}-${opt}`} />
                                  <Label htmlFor={`radio-${field.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}

                          {field.type === "checkbox" && (
                            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                              {field.options?.map((opt: string) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`check-${field.id}-${opt}`}
                                    checked={(examFormData[field.id] || []).includes(opt)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const current = examFormData[field.id] || [];
                                      const next = checked
                                        ? [...current, opt]
                                        : current.filter((i: string) => i !== opt);
                                      setExamFormData({ ...examFormData, [field.id]: next });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <Label htmlFor={`check-${field.id}-${opt}`} className="font-normal cursor-pointer whitespace-nowrap">{opt}</Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Activity className="w-5 h-5" />
                  Constantes Vitales
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Tension (SYS/DIA)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="120"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                        className="bg-background text-center"
                      />
                      <span className="text-xl text-muted-foreground font-light">
                        /
                      </span>
                      <Input
                        type="number"
                        placeholder="80"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                        className="bg-background text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                      <Weight className="w-3 h-3" /> Poids (kg)
                    </Label>
                    <Input
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Glycémie (g/l)
                    </Label>
                    <Input
                      type="number"
                      placeholder="1.0"
                      value={glucose}
                      onChange={(e) => setGlucose(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                      <Thermometer className="w-3 h-3" /> Température (°C)
                    </Label>
                    <Input
                      type="number"
                      placeholder="37.0"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Banknote className="w-5 h-5" />
                  Paiement
                </h3>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 max-w-xs">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                      Honoraires (DA)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="bg-background border-primary/20 font-bold text-primary text-lg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Ordonnance & Bilans */}
        <div className="overflow-y-auto pr-2 space-y-6 pb-6 custom-scrollbar relative">
          <div className="transition-all">
            <div className="space-y-6">
              {patient && (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="bg-primary/5 p-4 border-b">
                    <h3 className="font-semibold text-lg text-primary">Ordonnance</h3>
                  </div>
                  <div className="p-4">
                    <NewPrescriptionForm
                      id={id}
                      patient={patient}
                      onClose={() => { }}
                      refreshPrescriptions={() => { }}
                      inline={true}
                      consultationId={activeConsultationId || undefined}
                      ensureConsultationSaved={ensureConsultationSaved}
                    />
                  </div>
                </div>
              )}

              {patient && (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="bg-blue-500/5 p-4 border-b">
                    <h3 className="font-semibold text-lg text-blue-600">Bilan Sanguin</h3>
                  </div>
                  <div className="p-4">
                    <BloodWork
                      patient={patient}
                      onClose={() => { }}
                      refreshDocuments={() => { }}
                      inline={true}
                      consultationId={activeConsultationId || undefined}
                      ensureConsultationSaved={ensureConsultationSaved}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewConsultationForm;
