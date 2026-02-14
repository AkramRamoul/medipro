import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
    FileText,
    ArrowLeft,
    Save,
    Calendar as CalendarIcon,
    AlertTriangle,
} from "lucide-react";
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";
import { Card, CardHeader, CardTitle } from "../ui/card";
import Editor from "../Editor/Editor";
import { Patient } from "../../type";

interface DocumentTemplate {
    id: number;
    name: string;
    type: string;
    content: string;
}

interface NewDocumentFromTemplateProps {
    patient: Patient;
    onClose: () => void;
    refreshDocuments: () => void;
    initialTemplate?: DocumentTemplate | null;
    selectorOnly?: boolean;
    onTemplateSelect?: (template: DocumentTemplate) => void;
}

const NewDocumentFromTemplate: React.FC<NewDocumentFromTemplateProps> = ({
    patient,
    onClose,
    refreshDocuments,
    initialTemplate = null,
    selectorOnly = false,
    onTemplateSelect,
}) => {
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] =
        useState<DocumentTemplate | null>(initialTemplate);
    const [editedContent, setEditedContent] = useState("");
    const [documentDate, setDocumentDate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const result = await window.electronAPI.getDocumentTemplates();
                setTemplates(result);
            } catch (error) {
                toast.error("Erreur lors du chargement des modèles");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleSelectTemplate = (template: DocumentTemplate) => {
        if (selectorOnly && onTemplateSelect) {
            onTemplateSelect(template);
            return;
        }

        let content = template.content;
        const formattedDate = format(documentDate, "dd/MM/yyyy");
        content = content.replace(
            /\[Nom du Patient\]/g,
            `${patient.first_name} ${patient.last_name}`,
        );
        content = content.replace(/\[Date\]/g, formattedDate);

        setSelectedTemplate(template);
        setEditedContent(content);
    };

    // Initialize content if initialTemplate is provided
    useEffect(() => {
        if (initialTemplate) {
            const formattedDate = format(documentDate, "dd/MM/yyyy");
            let content = initialTemplate.content;
            content = content.replace(
                /\[Nom du Patient\]/g,
                `${patient.first_name} ${patient.last_name}`,
            );
            content = content.replace(/\[Date\]/g, formattedDate);
            setEditedContent(content);
        }
    }, [initialTemplate]);

    // Update placeholders when date changes if template is already selected
    useEffect(() => {
        if (selectedTemplate) {
            const formattedDate = format(documentDate, "dd/MM/yyyy");
            let content = selectedTemplate.content;
            content = content.replace(
                /\[Nom du Patient\]/g,
                `${patient.first_name} ${patient.last_name}`,
            );
            content = content.replace(/\[Date\]/g, formattedDate);
            setEditedContent(content);
        }
    }, [documentDate]);

    const handleSave = async () => {
        if (!editedContent.trim()) {
            toast.error("Le contenu ne peut pas être vide");
            return;
        }

        if (!selectedTemplate) return;

        try {
            const result = await window.electronAPI.createDocument({
                patientId: patient.id,
                type: "template",
                content: editedContent,
                name: selectedTemplate.name,
                documentDate: documentDate.toISOString(),
            });

            if (result.success) {
                toast.success("Document enregistré avec succès");
                refreshDocuments();
                onClose();
            } else {
                toast.error(result.error || "Erreur lors de l'enregistrement");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Chargement des modèles...
            </div>
        );
    }

    if (selectedTemplate && !selectorOnly) {
        return (
            <div className="space-y-4 p-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (initialTemplate) {
                                    onClose();
                                } else {
                                    setSelectedTemplate(null);
                                }
                            }}
                            className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h3 className="text-2xl font-bold text-primary">
                                {selectedTemplate.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Édition du document pour {patient.first_name}{" "}
                                {patient.last_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-9 justify-start text-left font-normal border-dashed",
                                        !isToday(documentDate) &&
                                        "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/20",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(documentDate, "PPP", { locale: fr })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <div className="flex flex-col">
                                    <Calendar
                                        mode="single"
                                        selected={documentDate}
                                        onSelect={(date) => date && setDocumentDate(date)}
                                        initialFocus
                                        locale={fr}
                                    />
                                    {!isToday(documentDate) && (
                                        <div className="p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs h-8"
                                                onClick={() => setDocumentDate(new Date())}
                                            >
                                                Revenir à aujourd'hui
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {!isToday(documentDate) && (
                            <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                Date modifiée manuellement
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-xl border shadow-sm p-4 min-h-[500px]">
                        <Editor content={editedContent} onChange={setEditedContent} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" size="lg" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button
                            className="px-8 bg-primary hover:bg-primary/90 text-white"
                            size="lg"
                            onClick={handleSave}
                        >
                            <Save className="mr-2 h-4 w-4" /> Enregistrer le document
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 text-left">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Choisir un modèle
            </h3>
            <p className="text-sm text-muted-foreground">
                Sélectionnez le type de document que vous souhaitez créer.
            </p>
            {templates.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
                    <FileText className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Aucun modèle disponible</p>
                    <p className="text-sm opacity-70">
                        Créez des modèles dans les paramètres pour les voir ici.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            className="group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-none"
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <CardHeader className="p-5 flex flex-row items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold">
                                        {template.name}
                                    </CardTitle>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                        {template.type === "work_stop"
                                            ? "Arrêt de travail"
                                            : template.type === "medical_certificate"
                                                ? "Certificat médical"
                                                : template.type === "chronic_disease"
                                                    ? "Maladie chronique"
                                                    : "Document standard"}
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewDocumentFromTemplate;
