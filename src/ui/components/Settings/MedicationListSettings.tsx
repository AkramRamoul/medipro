import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Search, Loader2 } from "lucide-react";
import api from "../../axios";

interface CustomMedication {
    name: string;
    form: string;
    dosage: string;
}

const MedicationListSettings: React.FC = () => {
    const [medications, setMedications] = useState<CustomMedication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newName, setNewName] = useState("");
    const [newForm, setNewForm] = useState("");
    const [newDosage, setNewDosage] = useState("");

    const fetchMedications = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/prescriptions/custom-medications");
            setMedications(response.data || []);
        } catch (error) {
            toast.error("Erreur lors du chargement des médicaments");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, []);

    const filteredMedications = useMemo(() => {
        return medications.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.form.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [medications, searchQuery]);

    const handleAdd = () => {
        const name = newName.trim();
        const form = newForm.trim();
        const dosage = newDosage.trim();

        if (!name) {
            toast.error("Le nom du médicament est obligatoire");
            return;
        }

        if (medications.some((m) => m.name.toLowerCase() === name.toLowerCase() && m.form.toLowerCase() === form.toLowerCase() && m.dosage.toLowerCase() === dosage.toLowerCase())) {
            toast.error("Ce médicament existe déjà dans la liste personnalisée");
            return;
        }

        setMedications([{ name, form, dosage }, ...medications]);
        setNewName("");
        setNewForm("");
        setNewDosage("");
        toast.info("Médicament ajouté à la liste temporaire. N'oubliez pas d'enregistrer.");
    };

    const handleDelete = (name: string, form: string, dosage: string) => {
        setMedications(medications.filter((m) => !(m.name === name && m.form === form && m.dosage === dosage)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.post("/prescriptions/custom-medications", medications);
            if (response.data.success) {
                toast.success("Liste des médicaments mise à jour avec succès");
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
        <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold">Catalogue Médicaments Personnalisé</h3>
                    <p className="text-sm text-muted-foreground">
                        Ajoutez des médicaments spécifiques qui n'apparaissent pas dans la liste par défaut.
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
                        <label className="text-sm font-medium">Ajouter un nouveau médicament</label>
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder="Nom du médicament (ex: Paracétamol)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Forme (ex: Comprimé)"
                                    value={newForm}
                                    onChange={(e) => setNewForm(e.target.value)}
                                />
                                <Input
                                    placeholder="Dosage (ex: 500mg)"
                                    value={newDosage}
                                    onChange={(e) => setNewDosage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                />
                            </div>
                            <Button onClick={handleAdd} className="mt-2">
                                <Plus className="h-4 w-4 mr-2" /> Ajouter
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-sm font-medium text-muted-foreground italic">
                            Nombre de médicaments personnalisés : {medications.length}
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Rechercher dans la liste personnalisée..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-md max-h-[400px] overflow-y-auto divide-y divide-border bg-muted/20">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
                        ) : filteredMedications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                Aucun résultat trouvé.
                            </div>
                        ) : (
                            filteredMedications.map((med, idx) => (
                                <div key={idx} className="flex flex-col p-3 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">{med.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(med.name, med.form, med.dosage)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                        {med.form && <span className="bg-muted px-1.5 py-0.5 rounded">{med.form}</span>}
                                        {med.dosage && <span>{med.dosage}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicationListSettings;
