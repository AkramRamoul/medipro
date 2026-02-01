import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { FileText, ArrowLeft, Save } from "lucide-react";
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
}

const NewDocumentFromTemplate: React.FC<NewDocumentFromTemplateProps> = ({
    patient,
    onClose,
    refreshDocuments
}) => {
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
    const [editedContent, setEditedContent] = useState("");

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
        let content = template.content;
        // Basic placeholder replacement
        const today = new Date().toLocaleDateString('fr-FR');
        content = content.replace(/\[Nom du Patient\]/g, `${patient.first_name} ${patient.last_name}`);
        content = content.replace(/\[Date\]/g, today);

        setSelectedTemplate(template);
        setEditedContent(content);
    };

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
                name: selectedTemplate.name
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
        return <div className="p-8 text-center text-muted-foreground">Chargement des modèles...</div>;
    }

    if (selectedTemplate) {
        return (
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-lg font-medium">{selectedTemplate.name}</h3>
                    </div>
                </div>

                <div className="space-y-4">
                    <Editor content={editedContent} onChange={setEditedContent} />

                    <div className="flex gap-2">
                        <Button className="flex-1 text-white" onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" /> Enregistrer le document
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium">Choisir un modèle</h3>
            {templates.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                    <p>Aucun modèle disponible.</p>
                    <p className="text-sm">Créez des modèles dans les paramètres.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <CardHeader className="p-4 flex flex-row items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-sm">{template.name}</CardTitle>
                                    <p className="text-[10px] text-muted-foreground uppercase">
                                        {template.type === 'work_stop' ? 'Arrêt de travail' :
                                            template.type === 'medical_certificate' ? 'Certificat médical' :
                                                template.type === 'chronic_disease' ? 'Maladie chronique' :
                                                    'Document'}
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
