import { useState, useRef } from "react";
import { DatabaseBackup, RotateCcw, Loader2, Info } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { toast } from "sonner";
import api from "../../axios";

export default function DatabaseSettings() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleBackup() {
    setLoading(true);
    try {
      const response = await api.get("/settings/backup", {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Sauvegarde effectuée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = confirm(
      "La restauration d'une sauvegarde remplacera les données actuelles. Continuer ?",
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('database', file);

      const response = await api.post("/settings/restore", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success("Restauration effectuée. L'application va redémarrer.");
        // Reload the app to pick up new database state
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error("Échec de la restauration");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la restauration");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de données & Diagnostics</CardTitle>
        <CardDescription>
          Gérez votre base de données et importez les nomenclatures médicales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Maintenance</h4>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Il est recommandé de sauvegarder vos données régulièrement
              (idéalement chaque semaine) pour éviter toute perte.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center sm:flex-row gap-4">
            <Button
              onClick={handleBackup}
              disabled={loading}
              className="w-full sm:w-auto text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DatabaseBackup className="mr-2 h-4 w-4" />
              )}
              Sauvegarder la base de données
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestore}
              accept=".db"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Restaurer la base de données
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
