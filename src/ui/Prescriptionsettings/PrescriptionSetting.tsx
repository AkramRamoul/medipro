import React, { useEffect, useState, useCallback } from "react";
import { useFileUploader } from "../hooks/use-file-uploader";
import api from "../axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import PrintButton from "./EmptyPrintButton";
import { PrescriptionPreview } from "./PrescriptionPreview";
import { Layout, RotateCcw, RefreshCw, Loader2 } from "lucide-react";

import { FormState, ServiceItem, TemplateLayout } from "./types";
import { TemplateLayoutSelector } from "./components/TemplateLayoutSelector";
import { DoctorInfoSection } from "./components/DoctorInfoSection";
import { ServicesSection } from "./components/ServicesSection";
import { ContactAndRegistration } from "./components/ContactAndRegistration";
import { VisualAndLayoutSettings } from "./components/VisualAndLayoutSettings";
import { LogoUploadSection } from "./components/LogoUploadSection";

const DEFAULT_FORM: FormState = {
  nameFr: "",
  nameAr: "",
  specialtyFr: "",
  specialtyAr: "",
  servicesFr: "",
  servicesAr: "",
  inscriptionNumber: "",
  address: "",
  phoneNumber1: "",
  phoneNumber2: "",
  city: "",
  accentColor: "#000000",
  fontFamily: "serif",
  doctorNameFontSize: 14,
  specialtyFontSize: 10,
  titleFontSize: 18,
  bodyFontSize: 12,
  logoSize: 60,
  watermarkOpacity: 10,
  dividerStyle: "solid",
  titleText: "ORDONNANCE",
  showInscriptionNumber: true,
  templateLayout: "bilingual",
};

const DEFAULT_SERVICES: ServiceItem[] = [{ fr: "", ar: "" }];

export function PrescriptionModelForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ── Unified setter (replaces both handleChange and handleFieldValueChange) ──
  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setField(e.target.name as keyof FormState, e.target.value as never);
    },
    [setField]
  );

  // ── Fetch from server (reload current saved state) ──
  const loadData = useCallback(async () => {
    setIsFetching(true);
    try {
      const [logoRes, modelRes] = await Promise.all([
        api.get("/settings/logo"),
        api.get("/settings/prescription-model"),
      ]);

      if (logoRes.data.success && logoRes.data.image) {
        setLogoImage(logoRes.data.image);
      }

      if (modelRes.data.success && modelRes.data.model) {
        const model = modelRes.data.model;
        // Merge with defaults — no need to enumerate every field manually
        setForm({ ...DEFAULT_FORM, ...model });

        try {
          const fr: string[] = JSON.parse(model.servicesFr || "[]");
          const ar: string[] = JSON.parse(model.servicesAr || "[]");
          const parsed = fr.map((f, i) => ({ fr: f, ar: ar[i] || "" }));
          if (parsed.length > 0) setServices(parsed);
        } catch {
          // Ignore malformed service data
        }
      }
    } catch (error) {
      console.error("Error loading prescription settings:", error);
      toast.error("Impossible de charger les paramètres.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  // ── Reset to factory defaults (no server call) ──
  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setServices(DEFAULT_SERVICES);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Services handlers ──
  const addService = useCallback(() => {
    setServices((prev) => (prev.length < 3 ? [...prev, { fr: "", ar: "" }] : prev));
  }, []);

  const removeService = useCallback((index: number) => {
    setServices((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  }, []);

  const handleServiceChange = useCallback(
    (index: number, lang: "fr" | "ar", value: string) => {
      setServices((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [lang]: value };
        return updated;
      });
    },
    []
  );

  // ── Layout change ──
  const handleLayoutChange = useCallback(
    (layout: TemplateLayout) => setField("templateLayout", layout),
    [setField]
  );

  const fileUploaderProps = useFileUploader();

  // ── Submit ──
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form, services };
      const { data: result } = await api.post("/settings/prescription-model", payload);
      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        if (result.model) {
          setForm((prev) => ({ ...prev, ...result.model }));
          if (result.model.services) setServices(result.model.services);
        }
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving prescription model:", error);
      toast.error("Erreur lors de l'enregistrement du modèle");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Form */}
        <div className="space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-xl">Concevez votre ordonnance</CardTitle>
                    <CardDescription>
                      Personnalisez l'en-tête et le pied de page de vos ordonnances.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Reset to defaults */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isFetching || isSaving}
                    className="gap-2"
                    title="Réinitialiser aux valeurs par défaut"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </Button>
                  {/* Reload from server */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    disabled={isFetching || isSaving}
                    className="gap-2"
                    title="Recharger les données enregistrées"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recharger
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">

                <TemplateLayoutSelector
                  form={form}
                  onChange={handleLayoutChange}
                />

                <DoctorInfoSection
                  form={form}
                  onChange={handleChange}
                />

                <ServicesSection
                  services={services}
                  onAdd={addService}
                  onRemove={removeService}
                  onChange={handleServiceChange}
                />

                <ContactAndRegistration
                  form={form}
                  onChange={handleChange}
                />

                <VisualAndLayoutSettings
                  form={form}
                  onChange={handleChange}
                  setFieldValue={setField}
                />

                <div className="flex gap-4 pt-4">
                  <Button disabled={isSaving} type="submit" className="flex-1 h-11 text-lg font-semibold">
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                  {form && <PrintButton model={form} image={logoImage} />}
                </div>
              </form>
            </CardContent>
          </Card>

          <LogoUploadSection
            logoImage={logoImage}
            setLogoImage={setLogoImage}
            handleFileUpload={fileUploaderProps.handleFileUpload}
          />

        </div>

        {/* Right Side: Preview */}
        <div className="lg:sticky lg:top-8">
          <PrescriptionPreview
            form={form}
            services={services}
            logoImage={logoImage}
          />
        </div>
      </div>
    </div>
  );
}
