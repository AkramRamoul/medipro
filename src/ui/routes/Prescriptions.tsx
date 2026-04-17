import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { PrescriptionWithPatient } from "../type";
import Modal from "../components/Modal";
import SinglePrescription from "../components/Prescription/SinglePrescription";
import Pagination from "../components/Pagination";
import { Loader2, Search, Pill, Calendar, User, FileText } from "lucide-react";
import DropDown from "./comps/DropDownPrescription";
import { Button } from "../components/ui/button";
import GenericPrescriptionModal from "../components/Prescription/GenericPrescriptionModal";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../axios";
import { X } from "lucide-react";

// ── helpers ───────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

type Preset = "today" | "week" | "month" | "all";
const PRESETS: { label: string; id: Preset }[] = [
  { label: "Aujourd'hui", id: "today" },
  { label: "Cette semaine", id: "week" },
  { label: "Ce mois", id: "month" },
  { label: "Tout", id: "all" },
];

async function getData(): Promise<PrescriptionWithPatient[]> {
  try {
    return await api.get("/prescriptions");
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    return [];
  }
}

function Prescriptions() {
  const [data, setData] = useState<PrescriptionWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState<Preset>("all");
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionWithPatient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false);
  const [newPrescriptionStep, setNewPrescriptionStep] = useState<1 | 2>(1);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset);
    setCurrentPage(1);
    if (preset === "today") {
      setDateFrom(today());
      setDateTo(today());
    }
    if (preset === "week") {
      setDateFrom(daysAgo(6));
      setDateTo(today());
    }
    if (preset === "month") {
      setDateFrom(firstOfMonth());
      setDateTo(today());
    }
    if (preset === "all") {
      setDateFrom("");
      setDateTo("");
    }
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setActivePreset("all");
    setCurrentPage(1);
  };

  const fetchData = async () => {
    setIsLoading(true);
    const prescriptions = await getData();
    // @ts-ignore
    setData(prescriptions.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const itemsPerPage = 8;
  const filteredData = data.filter((prescription) => {
    const first = prescription.patient?.first_name?.toLowerCase() || "";
    const last = prescription.patient?.last_name?.toLowerCase() || "";
    const full1 = `${first} ${last}`;
    const full2 = `${last} ${first}`;
    const q = query.trim().toLowerCase();

    const nameMatch =
      first.includes(q) || last.includes(q) || full1.includes(q) || full2.includes(q);

    // Date range filter
    const prescriptionDate = prescription.date
      ? new Date(prescription.date).toISOString().slice(0, 10)
      : "";
    const fromOk = !dateFrom || prescriptionDate >= dateFrom;
    const toOk = !dateTo || prescriptionDate <= dateTo;

    return nameMatch && fromOk && toOk;
  });

  const hasDateFilter = !!dateFrom || !!dateTo;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const location = useLocation();
  useEffect(() => {
    const state = location.state as { openNewPrescription?: boolean } | null;

    if (state?.openNewPrescription) {
      setIsNewPrescriptionOpen(true);
      setNewPrescriptionStep(1);
    }
  }, [location.state]);

  return (
    <div className="max-w-[80%] mx-auto space-y-6 mt-8">
      {/* Header Card */}
      <Card className="border border-white/5 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Pill className="w-5 h-5" />
              Dossier des Ordonnances
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 pb-2">
              Gérez toutes les ordonnances délivrées.
            </p>
          </div>
          <Button
            onClick={() => setIsNewPrescriptionOpen(true)}
            className="ml-4 gap-2 hover:shadow-lg hover:shadow-primary/20 transition"
          >
            <Plus className="h-4 w-4" /> Nouvelle Ordonnance
          </Button>
        </CardHeader>
      </Card>

      <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
        {/* Search + Date filter bar */}
        <div className="p-4 border-b bg-muted/20 space-y-3">
          {/* Row 1: search + date inputs */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-md">
              <Input
                placeholder="Filtrer par Nom ou Prénom..."
                className="pl-10 h-10 rounded-lg border-input bg-background"
                value={query}
                onChange={handleQueryChange}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Search className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={dateFrom}
                max={dateTo || today()}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setActivePreset("all");
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={today()}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setActivePreset("all");
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {hasDateFilter && (
                <button
                  type="button"
                  onClick={clearDates}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                  title="Effacer les dates"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Row 2: preset chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant={activePreset === p.id ? "default" : "outline"}
                className="h-7 text-xs rounded-full px-3"
                onClick={() => applyPreset(p.id)}
              >
                {p.label}
              </Button>
            ))}
            {hasDateFilter && (
              <span className="text-xs text-muted-foreground ml-2">
                {filteredData.length} résultat
                {filteredData.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="p-2">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/60 border-b border-white/10 backdrop-blur">
                <TableRow>
                  <TableHead className="w-[30%]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" /> Nom
                    </div>
                  </TableHead>
                  <TableHead className="w-[30%]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" /> Prénom
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Options
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((prescription) => (
                    <TableRow
                      key={prescription.id}
                      onClick={() => setSelectedPrescription(prescription)}
                      className=" hover:bg-white/[0.04] odd:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <TableCell className="font-semibold">
                        {prescription.patient?.first_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {prescription.patient?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString(
                            "fr-FR",
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex justify-end items-center h-full opacity-60 hover:opacity-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropDown
                            prescription={prescription}
                            setData={setData}
                            patient={prescription.patient!}
                            medications={prescription.medications}
                            isPsychotropic={prescription.isPsychotropic}
                            psychotropicNumber={prescription.psychotropicNumber}
                            patientAddress={prescription.patientAddress}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 opacity-20" />
                        <p>Aucune ordonnance correspondante trouvée.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="p-4 border-t bg-muted/20">
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      >
        {selectedPrescription && (
          <SinglePrescription
            meds={selectedPrescription.medications}
            onClose={() => setSelectedPrescription(null)}
            patient={selectedPrescription.patient!}
            isPsychotropic={selectedPrescription.isPsychotropic}
            psychotropicNumber={selectedPrescription.psychotropicNumber}
            patientAddress={selectedPrescription.patientAddress}
            prescriptionDate={selectedPrescription.date}
          />
        )}
      </Modal>

      {/* New Prescription Modal */}
      <Dialog
        open={isNewPrescriptionOpen}
        onOpenChange={(open) => {
          setIsNewPrescriptionOpen(open);

          if (!open) {
            setNewPrescriptionStep(1);
          }
        }}
      >
        <DialogContent
          className={cn(
            "p-0 transition-all duration-300 max-h-[90vh] overflow-y-auto",
            newPrescriptionStep === 1 ? "sm:max-w-xl" : "sm:max-w-6xl",
          )}
        >
          {/* Gradient accent top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60 rounded-t-lg" />

          <DialogHeader className="px-6 pt-5 pb-3">
            <DialogTitle asChild>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-none">Nouvelle Ordonnance</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {newPrescriptionStep === 1
                        ? "Étape 1 sur 2 — Informations patient"
                        : "Étape 2 sur 2 — Composition de l'ordonnance"}
                    </p>
                  </div>
                </div>
                {/* Step pills */}
                <div className="flex items-center gap-1.5 mr-6">
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                      newPrescriptionStep === 1
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <span>1</span>
                    <span className="hidden sm:inline">Patient</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                      newPrescriptionStep === 2
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span>2</span>
                    <span className="hidden sm:inline">Médicaments</span>
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 pt-0">
            <GenericPrescriptionModal
              onClose={() => setIsNewPrescriptionOpen(false)}
              refreshPrescriptions={fetchData}
              onStepChange={setNewPrescriptionStep}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Prescriptions;
