import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  FlaskConical,
  LineChart as LineChartIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

function statusLabel(status: "low" | "normal" | "high") {
  if (status === "high") return "Eleve";
  if (status === "low") return "Bas";
  return "Normal";
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

  const fetchPanels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getPatientLabResults(Number(patientId));
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
      prev.map((entry) => (entry.id === entryId ? { ...entry, [key]: value } : entry)),
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
      toast.error("Ajoutez au moins un resultat valide");
      return;
    }

    try {
      setSaving(true);
      const measuredDate = measuredAt
        ? new Date(measuredAt).toISOString()
        : new Date().toISOString();
      const result = await window.electronAPI.addLabPanel({
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

      toast.success("Panel biologique enregistre");
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
      const result = await window.electronAPI.deleteLabPanel(panelId);
      if (!result.success) {
        toast.error(result.error || "Impossible de supprimer le panel");
        return;
      }
      toast.success("Panel supprime");
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

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const result = await window.electronAPI.exportLabResultsExcel(Number(patientId));
      if (!result.success) {
        if (result.error !== "Cancelled") {
          toast.error(result.error || "Export impossible");
        }
        return;
      }
      toast.success("Export Excel termine");
    } catch (error) {
      console.error("Failed to export lab results:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FlaskConical className="h-5 w-5 text-primary" />
              Suivi des analyses biologiques
            </CardTitle>
            <Button
              type="button"
              variant="outline"
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
          <CardDescription>
            Enregistrez des panels structures, detectez les anomalies et suivez les tendances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Nom du bilan</Label>
              <Input
                value={panelName}
                onChange={(event) => setPanelName(event.target.value)}
                placeholder="Ex: Bilan metabolique"
              />
            </div>
            <div className="space-y-2">
              <Label>Date du prelevement</Label>
              <Input
                type="datetime-local"
                value={measuredAt}
                onChange={(event) => setMeasuredAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Contexte clinique (optionnel)"
                className="min-h-[40px]"
              />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parametre</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Unite</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Input
                        value={entry.testName}
                        onChange={(event) =>
                          handleEntryChange(entry.id, "testName", event.target.value)
                        }
                        placeholder="Ex: Glucose"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={entry.value}
                        onChange={(event) =>
                          handleEntryChange(entry.id, "value", event.target.value)
                        }
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.unit}
                        onChange={(event) =>
                          handleEntryChange(entry.id, "unit", event.target.value)
                        }
                        placeholder="mg/dL"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={entry.referenceMin}
                        onChange={(event) =>
                          handleEntryChange(entry.id, "referenceMin", event.target.value)
                        }
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={entry.referenceMax}
                        onChange={(event) =>
                          handleEntryChange(entry.id, "referenceMax", event.target.value)
                        }
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="gap-2" onClick={handleAddEntry}>
              <Plus className="h-4 w-4" />
              Ajouter un parametre
            </Button>
            <Button type="button" className="gap-2" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer le panel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChartIcon className="h-4 w-4 text-primary" />
              Tendances par parametre
            </CardTitle>
            <CardDescription>
              Selectionnez un test pour visualiser son evolution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testOptions.length > 0 ? (
              <div className="space-y-4">
                <select
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={selectedTest}
                  onChange={(event) => setSelectedTest(event.target.value)}
                >
                  {testOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        value,
                        name === "value"
                          ? "Valeur"
                          : name === "referenceMin"
                            ? "Min ref"
                            : "Max ref",
                      ]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.fullDate ? payload[0].payload.fullDate : label
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="referenceMin"
                      stroke="#22c55e"
                      strokeDasharray="5 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="referenceMax"
                      stroke="#ef4444"
                      strokeDasharray="5 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-10 text-center">
                Aucune donnee disponible pour les tendances.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Resultats et anomalies
            </CardTitle>
            <CardDescription>
              {abnormalCount} resultat{abnormalCount > 1 ? "s" : ""} hors plage de reference •{" "}
              {totalTests} test{totalTests > 1 ? "s" : ""} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                value={panelSearch}
                onChange={(event) => setPanelSearch(event.target.value)}
                placeholder="Rechercher panel/test"
                className="sm:col-span-2"
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "abnormal")}
              >
                <option value="all">Tous les panels</option>
                <option value="abnormal">Anormaux uniquement</option>
              </select>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {panels.length === 0 && loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des panels...
                </div>
              ) : filteredPanels.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun panel enregistre.</div>
              ) : (
                filteredPanels.map((panel) => {
                  const panelAbnormal = panel.entries.filter(
                    (entry) => entry.status === "high" || entry.status === "low",
                  ).length;
                  return (
                    <div key={panel.panelId} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{panel.panelName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(panel.measuredAt).toLocaleDateString("fr-FR")} •{" "}
                            {panel.entries.length} parametre{panel.entries.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={panelAbnormal > 0 ? "destructive" : "secondary"}>
                            {panelAbnormal > 0 ? `${panelAbnormal} anormal` : "OK"}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePanel(panel.panelId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {panel.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm gap-2"
                          >
                            <span className="text-foreground/90">{entry.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {entry.value}
                                {entry.unit ? ` ${entry.unit}` : ""}
                              </span>
                              <Badge
                                variant={
                                  entry.status === "normal" ? "secondary" : "destructive"
                                }
                              >
                                {statusLabel(entry.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
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
