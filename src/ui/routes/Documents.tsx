import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  FileText,
  Plus,
  Search,
  Loader2,
  User,
  Calendar,
  Printer,
  ChevronRight,
  ArrowRight,
  Trash2,
  Hash,
  FlaskConical,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { Input as ShadInput } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import NewDocumentFromTemplate from "../components/Documents/NewDocumentFromTemplate";
import { BloodWork } from "../components/Documents/BloodWork";
import { Patient } from "../type";
import Pagination from "../components/Pagination";
import api from "../axios";

// ── types ────────────────────────────────────────────────────────────────────
type DocWithPatient = {
  id: number;
  patientId: number;
  patientFirstName: string | null;
  patientLastName: string | null;
  patientAge: number | null;
  name: string | null;
  type: "blood" | "certificate" | "report" | "template";
  documentDate: string | null;
  createdAt: string | null;
  content: any;
};

// ── label helpers ─────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  blood: "Demande Bilan",
  certificate: "Certificat Médical",
  report: "Rapport Médical",
  template: "Lettre / Certificat",
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "blood") return <FlaskConical className="w-3.5 h-3.5" />;
  if (type === "certificate") return <FileCheck className="w-3.5 h-3.5" />;
  return <FileText className="w-3.5 h-3.5" />;
};

const TYPE_COLORS: Record<string, string> = {
  blood: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  certificate: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  report: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  template: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

// ── patient selector step ────────────────────────────────────────────────────
function PatientStep({
  onSelect,
  onClose,
}: {
  onSelect: (patient: Patient) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Manual fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");

  const isValid = firstName.trim() !== "" && lastName.trim() !== "";

  // live search
  useEffect(() => {
    if (!query.trim() || manualMode) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get('/patients');
        const allPatients: Patient[] = Array.isArray(data) ? data.map(p => ({
          ...p,
          first_name: p.first_name || p.firstname,
          last_name: p.last_name || p.lastname
        })) : [];
        const q = query.trim().toLowerCase();
        const filtered = allPatients.filter(p => {
          const fn = (p.first_name || "").toLowerCase();
          const ln = (p.last_name || "").toLowerCase();
          return (fn + ' ' + ln).includes(q) || (ln + ' ' + fn).includes(q);
        });
        setResults(filtered.slice(0, 10)); // limit to top 10 matches
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, manualMode]);

  const handleManualContinue = () => {
    if (!isValid) return;
    onSelect({
      id: 0,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      age: Number(age) || 0,
      gender: "Non spécifié",
      contact: "",
      createdAt: new Date().toISOString().split("T")[0],
    });
  };

  const initials = (firstName?.[0] ?? "") + (lastName?.[0] ?? "");

  return (
    <div className="space-y-5 px-1 py-1">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={!manualMode ? "default" : "outline"}
          className="flex-1 text-xs"
          onClick={() => setManualMode(false)}
        >
          Rechercher un patient
        </Button>
        <Button
          size="sm"
          variant={manualMode ? "default" : "outline"}
          className="flex-1 text-xs"
          onClick={() => setManualMode(true)}
        >
          Saisie manuelle
        </Button>
      </div>

      {manualMode ? (
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold transition-all",
                initials
                  ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {initials ? initials.toUpperCase() : <User className="w-5 h-5 opacity-50" />}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Nouveau patient"}
              </p>
              <p className="text-xs text-muted-foreground">Renseignez les informations</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nom <span className="text-destructive">*</span></Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex : Dupont"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prénom <span className="text-destructive">*</span></Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex : Jean"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Hash className="w-3 h-3 opacity-60" /> Âge
                <span className="text-muted-foreground font-normal">(optionnel)</span>
              </Label>
              <Input
                type="number"
                min={0}
                max={130}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Âge en années"
                onKeyDown={(e) => { if (e.key === "Enter" && isValid) handleManualContinue(); }}
              />
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              Annuler
            </Button>
            <Button onClick={handleManualContinue} disabled={!isValid} className="gap-2">
              Continuer <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <ShadInput
              placeholder="Rechercher par nom ou prénom..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun patient trouvé pour «&nbsp;{query}&nbsp;»
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="divide-y rounded-xl border overflow-hidden max-h-60 overflow-y-auto">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-primary/5 transition-colors group"
                  onClick={() => onSelect(p)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.age} ans</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {!query.trim() && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Tapez un nom pour rechercher dans la base de données
            </p>
          )}

          <div className="flex justify-start pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [creationMode, setCreationMode] = useState<"template" | "blood">("template");

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/documents/all");
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openDialog = (mode: "template" | "blood") => {
    setCreationMode(mode);
    setSelectedPatient(null);
    setStep(1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setStep(1);
    setSelectedPatient(null);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setStep(2);
  };

  // filter
  const filtered = docs.filter((d) => {
    const full = `${d.patientFirstName ?? ""} ${d.patientLastName ?? ""}`.toLowerCase();
    const name = (d.name ?? "").toLowerCase();
    const q = query.toLowerCase().trim();
    return full.includes(q) || name.includes(q);
  });

  const ITEMS_PER_PAGE = 10;
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handlePrint = async (doc: DocWithPatient) => {
    try {
      const patient = {
        first_name: doc.patientFirstName ?? "",
        last_name: doc.patientLastName ?? "",
        age: doc.patientAge ?? 0,
      };

      const [logoRes, modelRes] = await Promise.all([
        api.get("/settings/logo"),
        api.get("/settings/prescription-model"),
      ]);

      if (!modelRes.data.success) throw new Error("Modèle introuvable");

      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: DocumentPrintable } = await import("../components/Documents/DocumentPrintable");
      const { printHtml } = await import("../lib/print-utils");

      const html = renderToStaticMarkup(
        <DocumentPrintable
          first_name={patient.first_name}
          last_name={patient.last_name}
          patientAge={patient.age}
          prescriptionModel={modelRes.data.model}
          image={logoRes.data.success ? logoRes.data.image : null}
          documentContent={doc.content}
          documentType={doc.type}
          documentName={doc.name ?? undefined}
          documentDate={doc.documentDate}
        />
      );

      const result = await printHtml(`<!DOCTYPE html>${html}`);
      if (result.success) toast.success("Impression lancée !");
      else toast.error(`Erreur : ${result.error}`);
    } catch {
      toast.error("Erreur lors de l'impression");
    }
  };

  return (
    <div className="max-w-[85%] mx-auto space-y-6 mt-8">
      {/* Header */}
      <Card className="border border-white/5 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Documents Médicaux
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Créez et gérez tous les documents indépendamment des consultations.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 hover:shadow-lg hover:shadow-primary/20 transition">
                <Plus className="h-4 w-4" /> Nouveau <ChevronDown className="w-4 h-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => openDialog("template")} className="cursor-pointer gap-2 py-2.5">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="font-medium">Document / Certificat</span>
                  <span className="text-xs text-muted-foreground">Créer à partir d'un modèle</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog("blood")} className="cursor-pointer gap-2 py-2.5">
                <FlaskConical className="w-4 h-4 text-red-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Demande de Bilan</span>
                  <span className="text-xs text-muted-foreground">Prescrire des analyses</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </Card>

      {/* Table card */}
      <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b bg-muted/20">
          <div className="relative max-w-md">
            <Input
              placeholder="Filtrer par patient ou type de document..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="p-2">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">
                    <div className="flex items-center gap-2"><User className="w-3 h-3" /> Patient</div>
                  </TableHead>
                  <TableHead className="w-[25%]">
                    <div className="flex items-center gap-2"><FileText className="w-3 h-3" /> Document</div>
                  </TableHead>
                  <TableHead className="w-[15%]">Type</TableHead>
                  <TableHead className="w-[20%]">
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</div>
                  </TableHead>
                  <TableHead className="text-right w-[15%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map((doc) => (
                    <TableRow key={doc.id} className="group">
                      <TableCell className="font-medium">
                        {doc.patientFirstName} {doc.patientLastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.name || TYPE_LABELS[doc.type] || doc.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold flex items-center gap-1 w-fit",
                            TYPE_COLORS[doc.type]
                          )}
                        >
                          <TypeIcon type={doc.type} />
                          {TYPE_LABELS[doc.type] || doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.documentDate
                          ? new Date(doc.documentDate).toLocaleDateString("fr-FR")
                          : doc.createdAt
                            ? new Date(doc.createdAt).toLocaleDateString("fr-FR")
                            : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => handlePrint(doc)}
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(doc.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-10 h-10 opacity-15" />
                        <p className="font-medium">
                          {query ? "Aucun document correspondant" : "Aucun document créé"}
                        </p>
                        {!query && (
                          <p className="text-xs opacity-70">
                            Cliquez sur «&nbsp;Nouveau Document&nbsp;» pour commencer.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="p-4 border-t bg-muted/20">
            <Pagination
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filtered.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ── New Document Dialog ───────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent
          className={cn(
            "p-0 transition-all duration-300 max-h-[90vh] overflow-y-auto",
            step === 1 ? "sm:max-w-lg" : "sm:max-w-5xl"
          )}
        >
          {/* accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60 rounded-t-lg" />

          <DialogHeader className="px-6 pt-5 pb-3">
            <DialogTitle asChild>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-none">
                      {creationMode === "template" ? "Nouveau Document" : "Nouvelle Demande de Bilan"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step === 1 ? "Étape 1 sur 2 — Sélection du patient" : "Étape 2 sur 2 — Rédaction"}
                    </p>
                  </div>
                </div>
                {/* step pills */}
                <div className="flex items-center gap-1.5 mr-6">
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                    step === 1 ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 text-primary"
                  )}>
                    <span>1</span><span className="hidden sm:inline">Patient</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                    step === 2 ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                  )}>
                    <span>2</span><span className="hidden sm:inline">Document</span>
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 pt-0">
            {step === 1 ? (
              <PatientStep
                onSelect={handlePatientSelect}
                onClose={closeDialog}
              />
            ) : selectedPatient ? (
              creationMode === "template" ? (
                <NewDocumentFromTemplate
                  patient={selectedPatient}
                  onClose={closeDialog}
                  refreshDocuments={fetchAll}
                />
              ) : (
                <BloodWork
                  patient={selectedPatient}
                  onClose={closeDialog}
                  refreshDocuments={fetchAll}
                />
              )
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
