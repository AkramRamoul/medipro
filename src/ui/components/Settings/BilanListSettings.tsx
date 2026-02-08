import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Search, Loader2 } from "lucide-react";

interface Bilan {
    name: string;
}

const BilanListSettings: React.FC = () => {
    const [bilans, setBilans] = useState<Bilan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newBilanName, setNewBilanName] = useState("");

    const fetchBilans = async () => {
        setIsLoading(true);
        try {
            const result = await window.electronAPI.getBilans();
            setBilans(result);
        } catch (error) {
            toast.error("Erreur lors du chargement des bilans");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBilans();
    }, []);

    const filteredBilans = useMemo(() => {
        return bilans.filter((b) =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [bilans, searchQuery]);

    const handleAdd = () => {
        const name = newBilanName.trim();
        if (!name) return;
        if (bilans.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
            toast.error("Ce bilan existe déjà dans la liste");
            return;
        }
        setBilans([{ name }, ...bilans]);
        setNewBilanName("");
        toast.info("Bilan ajouté à la liste temporaire. N'oubliez pas d'enregistrer.");
    };

    const handleDelete = (name: string) => {
        setBilans(bilans.filter((b) => b.name !== name));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await window.electronAPI.updateBilans(bilans);
            if (result.success) {
                toast.success("Liste des bilans mise à jour avec succès");
            } else {
                toast.error("Erreur lors de l'enregistrement : " + result.error);
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
                    <h3 className="text-lg font-medium">Gestion du Catalogue d'Analyses (Bilans)</h3>
                    <p className="text-sm text-muted-foreground">
                        Gérez la liste des analyses biologiques suggérées dans le formulaire de bilan.
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
                        <label className="text-sm font-medium">Ajouter une nouvelle analyse</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nom de l'analyse (ex: Ferritinémie)"
                                value={newBilanName}
                                onChange={(e) => setNewBilanName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <Button onClick={handleAdd}>
                                <Plus className="h-4 w-4 mr-2" /> Ajouter
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-sm font-medium text-muted-foreground italic">
                            Nombre total d'analyses : {bilans.length}
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Rechercher dans le catalogue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-md max-h-[400px] overflow-y-auto divide-y divide-border bg-muted/20">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
                        ) : filteredBilans.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                Aucun résultat trouvé.
                            </div>
                        ) : (
                            filteredBilans.map((bilan, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors">
                                    <span className="text-sm">{bilan.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(bilan.name)}
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

export default BilanListSettings;
