import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Trash2, Save, Plus, Edit2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Editor from "../Editor/Editor";
import api from "../../axios";

interface DocumentTemplate {
  id: number;
  name: string;
  type: "work_stop" | "medical_certificate" | "chronic_disease" | "custom";
  content: string;
  isDefault: boolean;
}

const DocumentTemplatesSettings: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] =
    useState<Partial<DocumentTemplate> | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/documents/templates/all');
      setTemplates(data);
    } catch (error) {
      console.error("Erreur lors du chargement des modèles:", error);
      toast.error("Erreur lors du chargement des modèles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name?.trim()) {
      toast.error("Le nom du modèle est requis");
      return;
    }
    if (!editingTemplate?.type) {
      toast.error("Le type de modèle est requis");
      return;
    }
    if (!editingTemplate?.content?.trim()) {
      toast.error("Le contenu du modèle est requis");
      return;
    }

    try {
      let result;
      if (editingTemplate.id) {
        const { data } = await api.put(`/documents/templates/${editingTemplate.id}`, editingTemplate);
        result = data;
      } else {
        const { data } = await api.post('/documents/templates', editingTemplate);
        result = data;
      }

      if (result.success) {
        toast.success("Modèle enregistré avec succès");
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du modèle:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?"))
      return;

    try {
      const { data: result } = await api.delete(`/documents/templates/${id}`);
      if (result.success) {
        toast.success("Modèle supprimé");
        fetchTemplates();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du modèle:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      name: "",
      type: "custom",
      content: "<h2>Nouveau Modèle</h2><p>Entrez votre texte ici...</p>",
      isDefault: false,
    });
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
  };

  if (editingTemplate) {
    return (
      <div className="space-y-6 m-8 p-6 bg-card text-foreground border border-border rounded-lg shadow-sm text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {editingTemplate.id ? "Modifier le modèle" : "Nouveau modèle"}
          </h3>
          <Button variant="ghost" onClick={() => setEditingTemplate(null)}>
            Annuler
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom du modèle</Label>
              <Input
                value={editingTemplate.name}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value,
                  })
                }
                placeholder="Ex: Certificat de sport"
              />
            </div>
            <div className="space-y-2">
              <Label>Type de document</Label>
              <Select
                value={editingTemplate.type}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(val: any) =>
                  setEditingTemplate({ ...editingTemplate, type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_certificate">
                    Certificat médical
                  </SelectItem>
                  <SelectItem value="work_stop">Arrêt de travail</SelectItem>
                  <SelectItem value="chronic_disease">
                    Maladie chronique
                  </SelectItem>
                  <SelectItem value="custom">Autre / Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contenu du modèle</Label>
            <Editor
              content={editingTemplate.content || ""}
              onChange={(content) =>
                setEditingTemplate({ ...editingTemplate, content })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Utilisez des placeholders comme [Nom du Patient], [Date], etc. que
              vous remplacerez lors de la création du document.
            </p>
          </div>

          <Button className="w-full text-white" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" /> Enregistrer le modèle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 m-8 p-6 bg-card text-foreground border border-border rounded-lg shadow-sm text-left">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Modèles de documents</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos modèles de certificats et lettres types.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="text-white">
          <Plus className="mr-2 h-4 w-4" /> Créer un modèle
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground">
          Chargement...
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Save className="h-12 w-12 opacity-20 mb-4" />
            <p>Aucun modèle trouvé.</p>
            <Button variant="link" onClick={handleCreateNew}>
              Cliquer ici pour en créer un
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`relative flex flex-col ${template.isDefault ? "border-primary/20 bg-primary/5" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                          Défaut
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {template.type.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div
                  className="text-xs text-muted-foreground line-clamp-3 prose prose-sm max-w-none dark:prose-invert pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: template.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-4">
        <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Protection des modèles par défaut
          </p>
          <p>
            Les modèles marqués d'un badge{" "}
            <span className="text-primary font-semibold text-[10px] uppercase">
              Défaut
            </span>{" "}
            peuvent être modifiés mais ne peuvent pas être supprimés. Cela
            garantit que vous disposez toujours des structures de base
            essentielles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplatesSettings;
