import { useState } from "react";
import { DatabaseBackup, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
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
      await window.electronAPI.backup();
      toast.success("Sauvegarde effectuée");
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
      await window.electronAPI.restore();
      toast.success("Restauration effectuée");
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
          <div className="flex flex-col items-center justify-center sm:flex-row gap-4">
            <Button
              onClick={handleBackup}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
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
              variant="destructive"
              className="w-full sm:w-auto"
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

        <Separator />
      </CardContent>
    </Card>
  );
}
