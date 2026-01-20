import { useState } from "react";
import { DatabaseBackup, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

declare global {
  interface Window {
    db: {
      backup: () => Promise<boolean>;
      restore: () => Promise<boolean>;
    };
  }
}

export default function DatabaseSettings() {
  const [loading, setLoading] = useState(false);

  async function handleBackup() {
    setLoading(true);
    await window.electronAPI.backup();
    setLoading(false);
  }

  async function handleRestore() {
    const confirmed = confirm(
      "Restoring a backup will replace current data. Continue?",
    );
    if (!confirmed) return;

    setLoading(true);
    await window.electronAPI.restore();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de données</CardTitle>
        <CardDescription>
          Gérez vos sauvegardes et restaurations de votre base de données.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col justify-center sm:flex-row gap-4">
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
      </CardContent>
    </Card>
  );
}
