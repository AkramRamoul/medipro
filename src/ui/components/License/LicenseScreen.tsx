import { useEffect, useState } from "react";
import {
  Copy,
  Key,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import api from "../../axios";

type LicensePayload = {
  expiry: string;
  machineId: string;
};

type LicenseScreenProps = {
  onSuccess: () => void;
};

export default function LicenseScreen({ onSuccess }: LicenseScreenProps) {
  const [key, setKey] = useState<string>("");
  const [status, setStatus] = useState<"valid" | "invalid" | "checking" | null>(
    null,
  );
  const [data, setData] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  async function getmachineId() {
    const { data } = await api.get("/users/machine-id");
    setData(data.id);
    return data.id;
  }

  useEffect(() => {
    getmachineId();
  }, []);

  const payload: LicensePayload = {
    expiry: "2126-12-31",
    machineId: data,
  };

  async function handleSubmit() {
    setStatus("checking");
    try {
      const { data: result } = await api.post("/users/license-submit", {
        key,
        payload,
      });
      setStatus(result.isValid ? "valid" : "invalid");
      if (result.isValid) {
        setTimeout(() => onSuccess(), 0);
      }
    } catch (error) {
      console.error("License submission failed:", error);
      setStatus("invalid");
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      {/* Abstract Background Shapes - Updated to medical teal/soft blue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="relative w-full max-w-md bg-card backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-border ring-1 ring-border/50">
        {/* Header Section - Medical Teal Gradient */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground">
          {/* Lifetime Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/30 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            <span className="text-white drop-shadow-sm">Licence à vie</span>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Activation du Produit
          </h1>
          <p className="text-primary-foreground/90 text-sm mt-2 font-medium">
            Entrez votre clé pour débloquer un accès illimité à vie
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Machine ID Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
              Identifiant Machine
            </label>
            <div className="group relative flex items-center bg-muted/50 border border-border rounded-xl p-1 pr-1.5 transition-all hover:border-primary/50 hover:shadow-sm">
              <code className="flex-1 text-sm font-mono text-foreground px-3 truncate select-all">
                {data || "Chargement..."}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background border border-border text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                title="Copier dans le presse-papier"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
              Partagez cet ID avec l'administrateur pour recevoir votre clé de
              licence.
            </p>
          </div>

          {/* License Input Section */}
          <div className="space-y-3">
            <label
              htmlFor="licenseKey"
              className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1"
            >
              Clé de Licence
            </label>
            <div className="relative">
              <Input
                id="licenseKey"
                type="text"
                placeholder="Collez votre clé de licence ici"
                className="w-full h-12 pl-11 pr-4 bg-background border-border rounded-xl text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (status) setStatus(null);
                }}
              />
              <Key className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Action & Status */}
          <div className="space-y-4 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!key || status === "checking"}
              className={`w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none
                ${status === "valid"
                  ? "bg-green-600 hover:bg-green-700 ring-green-500"
                  : status === "invalid"
                    ? "bg-destructive hover:bg-destructive/90 ring-destructive"
                    : "bg-primary hover:bg-primary/90 ring-primary"
                }`}
            >
              {status === "checking" ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Vérification...</span>
                </div>
              ) : status === "valid" ? (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Activation Réussie</span>
                </div>
              ) : status === "invalid" ? (
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Licence Invalide</span>
                </div>
              ) : (
                "Activer la Licence"
              )}
            </Button>

            {status === "invalid" && (
              <p className="text-center text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                La clé de licence fournie est incorrecte.
              </p>
            )}
            
            {!status && (
              <p className="text-center text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5 mt-2">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                Activation unique, aucun abonnement requis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
