import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  FlaskConical,
  LineChart as LineChartIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import api from "../../axios";
import type { LabPanel } from "../../type";

interface LabResultsTabProps {
  patientId: string;
}

type DraftEntry = {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceMin: string;
  referenceMax: string;
};

const COMMON_TESTS = [
  { name: "Glucose", unit: "mg/dL", min: "70", max: "110" },
  { name: "Hémoglobine Glyquée (HbA1c)", unit: "%", min: "4.0", max: "6.0" },
  { name: "Urée", unit: "g/L", min: "0.15", max: "0.45" },
  { name: "Créatinine", unit: "mg/L", min: "7", max: "13" },
  { name: "Cholestérol Total", unit: "g/L", min: "1.50", max: "2.00" },
  { name: "Triglycérides", unit: "g/L", min: "0.45", max: "1.50" },
  { name: "ASAT (TGO)", unit: "UI/L", min: "5", max: "40" },
  { name: "ALAT (TGP)", unit: "UI/L", min: "5", max: "45" },
  { name: "Fer Sérique", unit: "µg/dL", min: "60", max: "170" },
  { name: "Calcium", unit: "mg/L", min: "85", max: "105" },
  { name: "Acide Urique", unit: "mg/L", min: "35", max: "70" },
  { name: "Magnésium", unit: "mg/L", min: "18", max: "25" },
];

const createDraftEntry = (): DraftEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  testName: "",
  value: "",
  unit: "",
  referenceMin: "",
  referenceMax: "",
});

const toLocalDateTimeInput = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

function getStatus(value: string, min: string, max: string) {
  const v = parseFloat(value);
  const mn = parseFloat(min);
  const mx = parseFloat(max);
  if (isNaN(v)) return "normal";
  if (!isNaN(mn) && v < mn) return "low";
  if (!isNaN(mx) && v > mx) return "high";
  return "normal";
}

function StatusBadge({ status }: { status: "low" | "normal" | "high" }) {
  if (status === "high") return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Elevé</Badge>;
  if (status === "low") return <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">Bas</Badge>;
  return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Normal</Badge>;
}

export function LabResultsTab({ patientId }: LabResultsTabProps) {
  const [panels, setPanels] = useState<LabPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelName, setPanelName] = useState("");
  const [measuredAt, setMeasuredAt] = useState(toLocalDateTimeInput());
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<DraftEntry[]>([createDraftEntry()]);
  const [selectedTest, setSelectedTest] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "abnormal">("all");
  const [panelSearch, setPanelSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

  const fetchPanels = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/patients/${patientId}/lab-results`);
      setPanels(data);
    } catch (error) {
      console.error("Failed to fetch lab panels:", error);
      toast.error("Impossible de charger les analyses");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ patientId?: number }>).detail;
      if (detail?.patientId && detail.patientId !== Number(patientId)) return;
      fetchPanels();
    };

    window.addEventListener("lab-results-updated", handleUpdate);
    return () => {
      window.removeEventListener("lab-results-updated", handleUpdate);
    };
  }, [fetchPanels, patientId]);

  const testOptions = useMemo(() => {
    const names = new Set<string>();
    panels.forEach((panel) => {
      panel.entries.forEach((entry) => {
        if (entry.testName) names.add(entry.testName);
      });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [panels]);

  useEffect(() => {
    if (!selectedTest && testOptions.length > 0) {
      setSelectedTest(testOptions[0]);
    }
  }, [selectedTest, testOptions]);

  const trendData = useMemo(() => {
    if (!selectedTest) return [];
    return panels
      .flatMap((panel) =>
        panel.entries
          .filter((entry) => entry.testName === selectedTest)
          .map((entry) => ({
            date: new Date(panel.measuredAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            }),
            fullDate: new Date(panel.measuredAt).toLocaleDateString("fr-FR"),
            timestamp: new Date(panel.measuredAt).getTime(),
            value: Number(entry.value),
            referenceMin: entry.referenceMin ?? null,
            referenceMax: entry.referenceMax ?? null,
          })),
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [panels, selectedTest]);

  const abnormalCount = useMemo(
    () =>
      panels.reduce(
        (count, panel) =>
          count +
          panel.entries.filter((entry) => entry.status === "high" || entry.status === "low")
            .length,
        0,
      ),
    [panels],
  );

  const filteredPanels = useMemo(() => {
    const search = panelSearch.trim().toLowerCase();
    return panels.filter((panel) => {
      const hasAbnormal = panel.entries.some(
        (entry) => entry.status === "high" || entry.status === "low",
      );
      const matchesStatus = statusFilter === "all" ? true : hasAbnormal;
      const matchesSearch =
        search.length === 0 ||
        panel.panelName.toLowerCase().includes(search) ||
        panel.entries.some((entry) => entry.testName.toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });
  }, [panels, panelSearch, statusFilter]);

  const totalTests = useMemo(
    () => panels.reduce((sum, panel) => sum + panel.entries.length, 0),
    [panels],
  );

  const handleAddEntry = () => {
    setEntries((prev) => [...prev, createDraftEntry()]);
  };

  const handleRemoveEntry = (entryId: string) => {
    setEntries((prev) => (prev.length === 1 ? prev : prev.filter((entry) => entry.id !== entryId)));
  };

  const handleEntryChange = (entryId: string, key: keyof DraftEntry, value: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;

        let update = { ...entry, [key]: value };

        // Auto-fill from common tests
        if (key === "testName") {
          const common = COMMON_TESTS.find(t => t.name.toLowerCase() === value.toLowerCase());
          if (common) {
            update.unit = common.unit;
            update.referenceMin = common.min;
            update.referenceMax = common.max;
          }
        }

        return update;
      })
    );
  };

  const resetForm = () => {
    setPanelName("");
    setMeasuredAt(toLocalDateTimeInput());
    setNotes("");
    setEntries([createDraftEntry()]);
  };

  const handleSave = async () => {
    const cleanEntries = entries
      .filter((entry) => entry.testName.trim() && entry.value !== "")
      .map((entry) => ({
        testName: entry.testName.trim(),
        value: entry.value,
        unit: entry.unit.trim(),
        referenceMin: entry.referenceMin === "" ? null : entry.referenceMin,
        referenceMax: entry.referenceMax === "" ? null : entry.referenceMax,
      }));

    if (!panelName.trim()) {
      toast.error("Le nom du panel est requis");
      return;
    }

    if (cleanEntries.length === 0) {
      toast.error("Ajoutez au moins un résultat valide");
      return;
    }

    try {
      setSaving(true);
      const measuredDate = measuredAt
        ? new Date(measuredAt).toISOString()
        : new Date().toISOString();
      const { data: result } = await api.post('/patients/lab-panel', {
        patientId: Number(patientId),
        panelName: panelName.trim(),
        measuredAt: measuredDate,
        notes: notes.trim(),
        entries: cleanEntries,
      });

      if (!result.success) {
        toast.error(result.error || "Erreur pendant l'enregistrement");
        return;
      }

      toast.success("Panel biologique enregistré");
      resetForm();
      fetchPanels();
      window.dispatchEvent(
        new CustomEvent("lab-results-updated", {
          detail: { patientId: Number(patientId) },
        }),
      );
    } catch (error) {
      console.error("Failed to save lab panel:", error);
      toast.error("Echec de l'enregistrement du panel");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePanel = async (panelId: string) => {
    try {
      const { data: result } = await api.delete(`/patients/lab-panel/${panelId}`);
      if (!result.success) {
        toast.error(result.error || "Impossible de supprimer le panel");
        return;
      }
      toast.success("Panel supprimé");
      fetchPanels();
      window.dispatchEvent(
        new CustomEvent("lab-results-updated", {
          detail: { patientId: Number(patientId) },
        }),
      );
    } catch (error) {
      console.error("Failed to delete panel:", error);
      toast.error("Suppression impossible");
    }
  };

  const togglePanel = (panelId: string) => {
    setExpandedPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await api.get(`/patients/${patientId}/lab-export`, {
        responseType: 'blob', // Important for receiving binary data
      });
      
      // The backend returns a blob, so we create a link to download it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header if possible, or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `bilan_biologique_patient_${patientId}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Export Excel terminé");
    } catch (error) {
      console.error("Failed to export lab results:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Entry Form Card */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <FlaskConical className="h-5 w-5" />
              Nouveau Bilan Biologique
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={resetForm}
              >
                <X className="h-4 w-4 mr-1" /> Effacer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportExcel}
                disabled={exporting || panels.length === 0}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exporter Excel
              </Button>
            </div>
          </div>
          <CardDescription>
            Saisissez les résultats des analyses pour en assurer le suivi historique.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Nom du bilan</Label>
              <Input
                value={panelName}
                onChange={(event) => setPanelName(event.target.value)}
                placeholder="Ex: Bilan métabolique, NFS..."
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Date du prélèvement</Label>
              <Input
                type="datetime-local"
                value={measuredAt}
                onChange={(event) => setMeasuredAt(event.target.value)}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Notes cliniques</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Contexte, conditions de prélèvement..."
                className="min-h-[40px] resize-none border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Paramètre</TableHead>
                  <TableHead className="w-[120px]">Valeur</TableHead>
                  <TableHead className="w-[100px]">Unité</TableHead>
                  <TableHead className="w-[100px]">Min ref</TableHead>
                  <TableHead className="w-[100px]">Max ref</TableHead>
                  <TableHead className="w-[130px]">Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const status = getStatus(entry.value, entry.referenceMin, entry.referenceMax);
                  return (
                    <TableRow key={entry.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="py-2">
                        <Input
                          list="common-tests"
                          value={entry.testName}
                          onChange={(event) =>
                            handleEntryChange(entry.id, "testName", event.target.value)
                          }
                          placeholder="Ex: Glucose"
                          className="h-9 border-transparent group-hover:border-muted-foreground/20 focus:border-primary bg-transparent focus:bg-background transition-all"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          step="any"
                          value={entry.value}
                          onChange={(event) =>
                            handleEntryChange(entry.id, "value", event.target.value)
                          }
                          placeholder="0.00"
                          className="h-9 border-transparent group-hover:border-muted-foreground/20 focus:border-primary bg-transparent focus:bg-background transition-all font-medium"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          value={entry.unit}
                          onChange={(event) =>
                            handleEntryChange(entry.id, "unit", event.target.value)
                          }
                          placeholder="mg/dL"
                          className="h-9 border-transparent group-hover:border-muted-foreground/20 focus:border-primary bg-transparent focus:bg-background transition-all text-xs"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          step="any"
                          value={entry.referenceMin}
                          onChange={(event) =>
                            handleEntryChange(entry.id, "referenceMin", event.target.value)
                          }
                          placeholder="min"
                          className="h-9 border-transparent group-hover:border-muted-foreground/20 focus:border-primary bg-transparent focus:bg-background transition-all text-xs text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          step="any"
                          value={entry.referenceMax}
                          onChange={(event) =>
                            handleEntryChange(entry.id, "referenceMax", event.target.value)
                          }
                          placeholder="max"
                          className="h-9 border-transparent group-hover:border-muted-foreground/20 focus:border-primary bg-transparent focus:bg-background transition-all text-xs text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex justify-center">
                          <StatusBadge status={status} />
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <datalist id="common-tests">
              {COMMON_TESTS.map(t => <option key={t.name} value={t.name} />)}
            </datalist>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
              onClick={handleAddEntry}
            >
              <Plus className="h-4 w-4" />
              Ajouter un paramètre
            </Button>
            <Button
              type="button"
              className="gap-2 px-8 h-10 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer le panel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Visualization */}
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChartIcon className="h-5 w-5 text-primary" />
              Évolution des Paramètres
            </CardTitle>
            <CardDescription>
              Visualisez les tendances pour détecter les changements significatifs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {testOptions.length > 0 ? (
              <div className="space-y-6">
                <div className="relative">
                  <select
                    className="w-full h-10 rounded-md border border-primary/20 bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none pr-10"
                    value={selectedTest}
                    onChange={(event) => setSelectedTest(event.target.value)}
                  >
                    {testOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>

                <div className="h-[300px] w-full bg-muted/5 rounded-xl p-4 border border-dashed">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px'
                        }}
                        formatter={(value: number, name: string) => [
                          value,
                          name === "value"
                            ? "Valeur"
                            : name === "referenceMin"
                              ? "Min réf"
                              : "Max réf",
                        ]}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.fullDate ? payload[0].payload.fullDate : label
                        }
                      />
                      {trendData[0]?.referenceMin && trendData[0]?.referenceMax && (
                        <ReferenceArea
                          y1={trendData[0].referenceMin}
                          y2={trendData[0].referenceMax}
                          fill="hsl(var(--primary))"
                          fillOpacity={0.05}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center space-y-2">
                <LineChartIcon className="h-12 w-12 opacity-20" />
                <p className="text-sm">Aucune donnée disponible pour afficher les tendances.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History & Anomalies */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Résultats & Anomalies
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                {abnormalCount} Alerte{abnormalCount !== 1 ? 's' : ''}
              </Badge>
            </div>
            <CardDescription>
              {totalTests} test{totalTests > 1 ? "s" : ""} enregistré{totalTests > 1 ? "s" : ""} au total.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  value={panelSearch}
                  onChange={(event) => setPanelSearch(event.target.value)}
                  placeholder="Filtrer par panel ou test..."
                  className="pl-9 h-9 text-sm"
                />
                <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              </div>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "abnormal")}
              >
                <option value="all">Tous les panels</option>
                <option value="abnormal">Anomalies uniquement</option>
              </select>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {panels.length === 0 && loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p>Chargement des panels...</p>
                </div>
              ) : filteredPanels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground space-y-2 opacity-60">
                  <FlaskConical className="h-10 w-10" />
                  <p>Aucun résultat trouvé.</p>
                </div>
              ) : (
                filteredPanels.map((panel) => {
                  const panelAbnormal = panel.entries.filter(
                    (entry) => entry.status === "high" || entry.status === "low",
                  ).length;
                  const isExpanded = expandedPanels[panel.panelId];

                  return (
                    <div key={panel.panelId} className={`rounded-xl border transition-all duration-200 overflow-hidden ${panelAbnormal > 0 ? 'border-red-100 bg-red-50/10' : 'border-border'}`}>
                      <div
                        className={`flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-muted/20 transition-colors ${isExpanded ? 'bg-muted/10 border-b' : ''}`}
                        onClick={() => togglePanel(panel.panelId)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${panelAbnormal > 0 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                            {panelAbnormal > 0 ? '!' : '✓'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-none mb-1">{panel.panelName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                              {new Date(panel.measuredAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {panelAbnormal > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[9px] uppercase">
                              {panelAbnormal} Anormaux
                            </Badge>
                          )}
                          <div className="h-8 w-[1px] bg-border mx-1" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); handleDeletePanel(panel.panelId); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="text-muted-foreground">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3 bg-background/50 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          {panel.notes && (
                            <div className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-md mb-2 border-l-2 border-primary/20">
                              <span className="font-semibold uppercase mr-1">Note:</span> {panel.notes}
                            </div>
                          )}
                          <div className="space-y-1">
                            {panel.entries.map((entry) => (
                              <div
                                key={entry.id}
                                className={`flex items-center justify-between text-sm p-2 rounded-lg ${entry.status !== "normal" ? 'bg-red-50/50' : 'hover:bg-muted/30'}`}
                              >
                                <span className="font-medium text-foreground/90">{entry.testName}</span>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className={`font-bold ${entry.status !== "normal" ? 'text-red-600' : ''}`}>
                                      {entry.value} <span className="text-[10px] font-normal text-muted-foreground uppercase">{entry.unit}</span>
                                    </p>
                                    {(entry.referenceMax || entry.referenceMin) && (
                                      <p className="text-[9px] text-muted-foreground">
                                        Réf: {entry.referenceMin ?? '0'} - {entry.referenceMax ?? '∞'}
                                      </p>
                                    )}
                                  </div>
                                  <div className="w-16 flex justify-end">
                                    <StatusBadge status={entry.status} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
