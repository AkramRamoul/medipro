import { useState } from "react";
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

export default function DatabaseSettings() {
  const [loading, setLoading] = useState(false);

  async function handleBackup() {
    setLoading(true);
    try {
      const success = await window.electronAPI.backup();
      if (success) {
        toast.success("Sauvegarde effectuée");
      } else {
        toast.info("Sauvegarde annulée");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    const confirmed = confirm(
      "La restauration d'une sauvegarde remplacera les données actuelles. Continuer ?",
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const success = await window.electronAPI.restore();
      if (success) {
        toast.success("Restauration effectuée");
      } else {
        toast.info("Restauration annulée");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la restauration");
    } finally {
      setLoading(false);
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

            <Button
              onClick={handleRestore}
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
