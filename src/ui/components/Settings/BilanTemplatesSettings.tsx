import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Search, Loader2, FlaskConical, X } from "lucide-react";
import { Badge } from "../ui/badge";
import api from "../../axios";

interface Bilan {
    name: string;
}

interface BilanTemplate {
    name: string;
    tests: string[];
}

const BilanTemplatesSettings: React.FC = () => {
    const [templates, setTemplates] = useState<BilanTemplate[]>([]);
    const [allBilans, setAllBilans] = useState<Bilan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state for new template
    const [newTemplateName, setNewTemplateName] = useState("");
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [testSearch, setTestSearch] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [templatesRes, bilansRes] = await Promise.all([
                api.get("/consultations/bilans/templates"),
                api.get("/consultations/bilans/common")
            ]);
            setTemplates(templatesRes.data);
            setAllBilans(bilansRes.data);
        } catch (error) {
            toast.error("Erreur lors du chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAvailableTests = useMemo(() => {
        return allBilans.filter(b => 
            b.name.toLowerCase().includes(testSearch.toLowerCase()) && 
            !selectedTests.includes(b.name)
        );
    }, [allBilans, testSearch, selectedTests]);

    const handleAddTest = (testName: string) => {
        if (!selectedTests.includes(testName)) {
            setSelectedTests([...selectedTests, testName]);
        }
    };

    const handleRemoveTest = (testName: string) => {
        setSelectedTests(selectedTests.filter(t => t !== testName));
    };

    const handleAddTemplate = () => {
        const name = newTemplateName.trim();
        if (!name) {
            toast.error("Le nom du modèle est requis");
            return;
        }
        if (selectedTests.length === 0) {
            toast.error("Ajoutez au moins une analyse au modèle");
            return;
        }
        if (templates.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            toast.error("Un modèle avec ce nom existe déjà");
            return;
        }

        setTemplates([...templates, { name, tests: selectedTests }]);
        setNewTemplateName("");
        setSelectedTests([]);
        toast.info("Modèle ajouté à la liste temporaire. N'oubliez pas d'enregistrer.");
    };

    const handleDeleteTemplate = (name: string) => {
        setTemplates(templates.filter(t => t.name !== name));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.post("/consultations/bilans/templates", templates);
            if (response.data.success) {
                toast.success("Modèles de bilans enregistrés avec succès");
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
                    <h3 className="text-xl font-semibold">Modèles de Bilans Personnalisés</h3>
                    <p className="text-sm text-muted-foreground">
                        Créez des groupes d'analyses fréquents pour les ajouter en un clic lors des consultations.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    variant="default"
                    className="shadow-md"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modèles
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t">
                {/* Create Section */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Créer un nouveau modèle
                    </h4>
                    
                    <div className="space-y-3 p-4 border rounded-md bg-muted/10">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Nom du modèle</label>
                            <Input 
                                placeholder="ex: Bilan Hépatique, NFS + CRP..." 
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Sélectionner des analyses</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    className="pl-8 h-8 text-sm"
                                    placeholder="Rechercher une analyse..."
                                    value={testSearch}
                                    onChange={(e) => setTestSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="max-h-40 overflow-y-auto border rounded divide-y bg-background">
                                {filteredAvailableTests.length === 0 ? (
                                    <p className="p-2 text-xs text-center text-muted-foreground">Aucune analyse disponible</p>
                                ) : (
                                    filteredAvailableTests.map(test => (
                                        <div key={test.name} className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors">
                                            <span className="text-xs">{test.name}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddTest(test.name)}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Analyses sélectionnées ({selectedTests.length})</label>
                            <div className="flex flex-wrap gap-1.5 p-2 min-h-[60px] border rounded-md bg-background">
                                {selectedTests.length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic flex items-center h-full w-full justify-center">Sélectionnez des analyses ci-dessus</p>
                                ) : (
                                    selectedTests.map(test => (
                                        <Badge key={test} variant="secondary" className="pl-2 pr-1 py-0.5 flex items-center gap-1 group">
                                            <span className="text-[10px]">{test}</span>
                                            <button onClick={() => handleRemoveTest(test)} className="opacity-50 hover:opacity-100 p-0.5">
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>

                        <Button className="w-full mt-2" size="sm" onClick={handleAddTemplate}>
                            Ajouter à la liste
                        </Button>
                    </div>
                </div>

                {/* List Section */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" /> Vos modèles existants
                    </h4>
                    
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
                        ) : templates.length === 0 ? (
                            <div className="p-12 text-center border border-dashed rounded-lg bg-muted/5">
                                <p className="text-sm text-muted-foreground italic">Aucun modèle créé pour le moment.</p>
                            </div>
                        ) : (
                            templates.map((template, idx) => (
                                <div key={idx} className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-all shadow-sm group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-sm text-primary">{template.name}</h5>
                                            <p className="text-[11px] text-muted-foreground">
                                                {template.tests.length} analyse{template.tests.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0"
                                            onClick={() => handleDeleteTemplate(template.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {template.tests.slice(0, 10).map((t, i) => (
                                            <span key={i} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                                                {t}
                                            </span>
                                        ))}
                                        {template.tests.length > 10 && (
                                            <span className="text-[9px] text-muted-foreground italic">+{template.tests.length - 10} de plus...</span>
                                        )}
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

export default BilanTemplatesSettings;
