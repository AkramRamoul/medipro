import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Search, Loader2 } from "lucide-react";
import api from "../../axios";

interface DiagnosticItem {
    name: string;
}

const DiagnosticListSettings: React.FC = () => {
    const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newDiagnosticName, setNewDiagnosticName] = useState("");

    const fetchDiagnostics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/consultations/diagnostics/common");
            setDiagnostics(response.data);
        } catch (error) {
            toast.error("Erreur lors du chargement des diagnostics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    const filteredDiagnostics = useMemo(() => {
        return diagnostics.filter((d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [diagnostics, searchQuery]);

    const handleAdd = () => {
        const name = newDiagnosticName.trim();
        if (!name) return;
        if (diagnostics.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
            toast.error("Ce diagnostic existe déjà dans la liste");
            return;
        }
        setDiagnostics([{ name }, ...diagnostics]);
        setNewDiagnosticName("");
        toast.info("Diagnostic ajouté à la liste temporaire. N'oubliez pas d'enregistrer.");
    };

    const handleDelete = (name: string) => {
        setDiagnostics(diagnostics.filter((d) => d.name !== name));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.post("/consultations/diagnostics/common", diagnostics);
            if (response.data.success) {
                toast.success("Liste des diagnostics mise à jour avec succès");
            } else {
                toast.error("Erreur lors de l'enregistrement : " + response.data.error);
            }
        } catch (error) {
            toast.error("Une erreur est survenue lors de l'enregistrement");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 m-8 p-6 bg-card text-foreground border border-border rounded-lg shadow-sm text-left">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">Gestion des Diagnostics Courants</h3>
                    <p className="text-sm text-muted-foreground">
                        Gérez la liste des diagnostics suggérés dans le formulaire de consultation.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    variant="default"
                    className="shadow-md"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ajouter un nouveau diagnostic</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nom du diagnostic (ex: Angine aiguë)"
                                value={newDiagnosticName}
                                onChange={(e) => setNewDiagnosticName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <Button onClick={handleAdd}>
                                <Plus className="h-4 w-4 mr-2" /> Ajouter
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-sm font-medium text-muted-foreground italic">
                            Nombre total de diagnostics : {diagnostics.length}
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Rechercher dans la liste..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-md max-h-[400px] overflow-y-auto divide-y divide-border bg-muted/20">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
                        ) : filteredDiagnostics.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                Aucun résultat trouvé.
                            </div>
                        ) : (
                            filteredDiagnostics.map((diagnostic, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors">
                                    <span className="text-sm">{diagnostic.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(diagnostic.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticListSettings;
