import { useCallback, useEffect, useState } from "react";
import { ConsultationWithPatient } from "../type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import SingleConsultation from "../components/Consultation/SingleConsultation";
import Pagination from "../components/Pagination";
import {
  Loader2,
  Search,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Activity,
  X,
} from "lucide-react";
import DeleteDialogue from "../components/DeleteDialogue";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import ModalV2 from "../components/Modalsecond";
import api from "../axios";

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
function Page() {
  const [data, setData] = useState<ConsultationWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState<Preset>("all");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset);
    setCurrentPage(1);
    if (preset === "today") { setDateFrom(today()); setDateTo(today()); }
    if (preset === "week") { setDateFrom(daysAgo(6)); setDateTo(today()); }
    if (preset === "month") { setDateFrom(firstOfMonth()); setDateTo(today()); }
    if (preset === "all") { setDateFrom(""); setDateTo(""); }
  };

  const clearDates = () => { setDateFrom(""); setDateTo(""); setActivePreset("all"); setCurrentPage(1); };

  const fetchConsultations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get("/consultations");
      setData(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const filteredData = data.filter((consultation) => {
    const first = consultation.patient?.first_name?.toLowerCase() || "";
    const last = consultation.patient?.last_name?.toLowerCase() || "";
    const full1 = `${first} ${last}`;
    const full2 = `${last} ${first}`;
    const q = query.trim().toLowerCase();

    const nameMatch =
      first.includes(q) || last.includes(q) || full1.includes(q) || full2.includes(q);

    // Date range filter
    const consultDate = consultation.date
      ? new Date(consultation.date).toISOString().slice(0, 10)
      : "";
    const fromOk = !dateFrom || consultDate >= dateFrom;
    const toOk = !dateTo || consultDate <= dateTo;

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

  return (
    <div className="max-w-[80%] mx-auto space-y-6 mt-8">
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Stethoscope className="w-5 h-5" />
              Dossier de Consultations
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 pb-2">
              Historique complet des consultations.
            </p>
          </div>
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
                onChange={e => { setDateFrom(e.target.value); setActivePreset("all"); setCurrentPage(1); }}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={today()}
                onChange={e => { setDateTo(e.target.value); setActivePreset("all"); setCurrentPage(1); }}
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
            {PRESETS.map(p => (
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
                {filteredData.length} résultat{filteredData.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="p-2">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" /> Patient
                    </div>
                  </TableHead>
                  <TableHead className="w-[130px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Motif de consultation
                    </div>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Diagnostic
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((consultation) => (
                    <TableRow
                      key={consultation.id}
                      onClick={() => {
                        setSelectedPrescriptionId(consultation.id.toString());
                      }}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-semibold">
                        {consultation.patient?.first_name || "N/A"}{" "}
                        {consultation.patient?.last_name || ""}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {new Date(consultation.date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2">
                          {consultation.reason || (
                            <span className="text-muted-foreground italic text-sm">
                              Non spécifié
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-1">
                          {consultation.diagnosis ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {consultation.diagnosis}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">
                              Non spécifié
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px]">
                        <div
                          className="flex justify-center items-center h-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DeleteDialogue
                            consultationId={consultation.id.toString()}
                            setData={setData}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Stethoscope className="w-8 h-8 opacity-20" />
                        <p>Aucune consultation correspondante trouvée.</p>
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

      {/* Modal */}
      {selectedPrescriptionId && (
        <ModalV2
          isOpen
          onClose={() => setSelectedPrescriptionId(null)}
          panelClassName="sm:max-w-4xl"
        >
          <SingleConsultation
            id={selectedPrescriptionId}
            onClose={() => {
              setSelectedPrescriptionId(null);
              fetchConsultations();
            }}
          />
        </ModalV2>
      )}
    </div>
  );
}

export default Page;
