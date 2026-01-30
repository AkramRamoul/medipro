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
    const data = await window.electronAPI.getMachineId();
    setData(data);
    return data;
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
    await new Promise((resolve) => setTimeout(resolve, 0));
    const isValid = await window.electronAPI.submitLicense(key, payload);
    setStatus(isValid ? "valid" : "invalid");
    if (isValid) {
      setTimeout(() => onSuccess(), 0);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20 ring-1 ring-gray-200/50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Activation du Produit
          </h1>
          <p className="text-blue-100 text-sm mt-2 opacity-90">
            Entrez votre clé de licence pour continuer
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Machine ID Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
              Identifiant Machine
            </label>
            <div className="group relative flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 pr-1.5 transition-all hover:border-blue-400 hover:shadow-sm">
              <code className="flex-1 text-sm font-mono text-gray-700 px-3 truncate select-all">
                {data || "Chargement..."}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <p className="text-[11px] text-gray-400 px-1">
              Partagez cet ID avec l'administrateur pour recevoir votre clé de
              licence.
            </p>
          </div>

          {/* License Input Section */}
          <div className="space-y-3">
            <label
              htmlFor="licenseKey"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
            >
              Clé de Licence
            </label>
            <div className="relative">
              <Input
                id="licenseKey"
                type="text"
                placeholder="Collez votre clé de licence ici"
                className="w-full h-12 pl-11 pr-4 bg-white border-gray-200 rounded-xl text-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (status) setStatus(null);
                }}
              />
              <Key className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Action & Status */}
          <div className="space-y-4 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!key || status === "checking"}
              className={`w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none
                ${
                  status === "valid"
                    ? "bg-green-600 hover:bg-green-700 ring-green-500"
                    : status === "invalid"
                      ? "bg-red-600 hover:bg-red-700 ring-red-500"
                      : "bg-blue-600 hover:bg-blue-700 ring-blue-500"
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
              <p className="text-center text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                La clé de licence fournie est incorrecte ou expirée.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
