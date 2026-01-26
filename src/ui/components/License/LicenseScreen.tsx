import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
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
  const [status, setStatus] = useState<string | null>(null);
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
    expiry: "2026-12-31",
    machineId: data,
  };

  async function handleSubmit() {
    const isValid = await window.electronAPI.submitLicense(key, payload);
    setStatus(isValid ? "Valid ✅" : "Invalid ❌");
    if (isValid) onSuccess();
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateId = (id: string) => {
    return id.length > 10 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <Card className="w-full max-w-2xl p-6 shadow-lg rounded-2xl">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-mono break-all">{truncateId(data)}</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseKey" className="text-base font-medium">
              License Key
            </Label>
            <Input
              id="licenseKey"
              type="text"
              placeholder="Enter your full license key"
              className="w-full h-14 text-sm font-mono overflow-auto"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold"
          >
            Activate
          </Button>
          {status && (
            <p className="text-center text-sm text-gray-700">{status}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
