import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
          setReason(inProgress.reason || "");
          setSymptoms(inProgress.symptoms || "");
          setDiagnosis(inProgress.diagnosis || "");
          setNotes(inProgress.notes || "");
          if (inProgress.bloodPressure) {
            const [sys, dia] = inProgress.bloodPressure.split('/');
            setBpSystolic(sys || "");
            setBpDiastolic(dia || "");
          }
          setGlucose(inProgress.glucose?.toString() || "");
          setWeight(inProgress.weight?.toString() || "");
          if (inProgress.formId) {
            setSelectedFormId(inProgress.formId.toString());
          }
          if (inProgress.formData) {
            setExamFormData(inProgress.formData);
          }
          setAmountPaid(inProgress.amountPaid?.toString() || "");
          toast.info("Reprise de la consultation en cours...");
        } else {
          // If no in-progress consultation, check for a checked_in appointment today
          api.get(`/appointments/patient/${id}`)
            .then(({ data: appointments }: { data: any[] }) => {
              const todayApt = appointments.find(a =>
                a.status === 'checked_in' &&
                a.date === today &&
                !a.consultation // Ensure no consultation exists yet
              );
              if (todayApt) {
                setLinkedAppointmentId(todayApt.id);
                setReason(todayApt.title || "");
              }
            });
        }
      })
      .catch(console.error);

    api.get('/consultations/diagnostics/common')
      .then(({ data }) => setAllDiagnostics(data))
      .catch(console.error);
  }, [id]);

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
      if (existingConsultationId) {
        await api.put(`/consultations/${existingConsultationId}`, consultationData);
      } else {
        await api.post('/consultations', consultationData);
      }
      toast.success("Consultation enregistrée avec succès !");
      refreshConsultations();
      window.dispatchEvent(
        new CustomEvent("patient-vitals-updated", {
          detail: { patientId: Number(id) },
        }),
      );
      window.dispatchEvent(new Event("consultations-updated"));
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'enregistrement de la consultation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto border-none shadow-none text-left">
      <CardHeader className="pb-6 border-b mb-6">
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
            <CardTitle className="flex items-center gap-3 text-2xl text-primary">
              <Stethoscope className="w-8 h-8" />
              {isResuming ? "Terminer la Consultation" : "Nouvelle Consultation"}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Remplissez les détails de la consultation pour {patient?.first_name}{" "}
              {patient?.last_name}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Section 1: Clinical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div
                          key={index}
                          className={`
                            relative flex items-center gap-2 px-3 py-2.5 text-sm rounded-md cursor-pointer transition-colors
                            ${index === highlightedIndex
                              ? "bg-accent/80 text-accent-foreground"
                              : "hover:bg-accent/50 hover:text-accent-foreground"
                            }
                          `}
                          onClick={() =>
                            selectDiagnosticSuggestion(suggestion.name)
                          }
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <Activity className="w-3.5 h-3.5 text-blue-500/70" />
                          <span className="flex-1">{suggestion.name}</span>
                          {diagnosis === suggestion.name && (
                            <Check className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <FileText className="w-4 h-4 text-gray-500" />
                Notes additionnelles
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, remarques..."
                className="min-h-[80px] bg-muted/30 resize-none"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Section: Specialty Exam Form */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <ClipboardList className="w-5 h-5" />
              Formulaire d'examen spécifique
            </h3>
            <div className="w-full md:w-72">
              <Select 
                value={selectedFormId} 
                onValueChange={(val) => {
                  setSelectedFormId(val);
                  // Initialize data for new fields if not already present
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
                        onChange={(e) => setExamFormData({...examFormData, [field.id]: e.target.value})}
                        className="bg-background"
                      />
                    )}

                    {field.type === "textarea" && (
                      <Textarea 
                        placeholder={field.placeholder}
                        value={examFormData[field.id] || ""}
                        onChange={(e) => setExamFormData({...examFormData, [field.id]: e.target.value})}
                        className="bg-background min-h-[100px]"
                      />
                    )}

                    {field.type === "number" && (
                      <Input 
                        type="number"
                        placeholder={field.placeholder}
                        value={examFormData[field.id] || ""}
                        onChange={(e) => setExamFormData({...examFormData, [field.id]: e.target.value})}
                        className="bg-background"
                      />
                    )}

                    {field.type === "date" && (
                      <Input 
                        type="date"
                        value={examFormData[field.id] || ""}
                        onChange={(e) => setExamFormData({...examFormData, [field.id]: e.target.value})}
                        className="bg-background"
                      />
                    )}

                    {field.type === "select" && (
                      <Select 
                        value={examFormData[field.id] || ""}
                        onValueChange={(val) => setExamFormData({...examFormData, [field.id]: val})}
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
                        onValueChange={(val) => setExamFormData({...examFormData, [field.id]: val})}
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
                                setExamFormData({...examFormData, [field.id]: next});
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

        {/* Section 2: Vitals */}
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

        {/* Section 3: Payment */}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            size="lg"
            className="gap-2 min-w-[150px]"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewConsultationForm;
