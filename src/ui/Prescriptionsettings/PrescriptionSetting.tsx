//psettinss
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
import { Layout, RotateCcw, Loader2 } from "lucide-react";

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

export function PrescriptionModelForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([{ fr: "", ar: "" }]);

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchImage = async () => {
    try {
      const { data } = await api.get("/settings/logo");
      if (data.success && data.image) {
        setLogoImage(data.image);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      toast.error("Impossible de charger le logo.");
    }
  };

  const fetchModel = async () => {
    try {
      const { data: result } = await api.get("/settings/prescription-model");
      if (result.success && result.model) {
        const model = result.model;

        setForm({
          nameFr: model.nameFr || "",
          nameAr: model.nameAr || "",
          specialtyFr: model.specialtyFr || "",
          specialtyAr: model.specialtyAr || "",
          servicesFr: model.servicesFr || "",
          servicesAr: model.servicesAr || "",
          inscriptionNumber: model.inscriptionNumber || "",
          address: model.address || "",
          phoneNumber1: model.phoneNumber1 || "",
          phoneNumber2: model.phoneNumber2 || "",
          city: model.city || "",
          accentColor: model.accentColor || "#000000",
          fontFamily: model.fontFamily || "serif",
          doctorNameFontSize: model.doctorNameFontSize ?? 14,
          specialtyFontSize: model.specialtyFontSize ?? 10,
          titleFontSize: model.titleFontSize ?? 18,
          bodyFontSize: model.bodyFontSize ?? 12,
          logoSize: model.logoSize ?? 60,
          watermarkOpacity: model.watermarkOpacity ?? 10,
          dividerStyle: model.dividerStyle || "solid",
          titleText: model.titleText || "ORDONNANCE",
          showInscriptionNumber: model.showInscriptionNumber ?? true,
          templateLayout: model.templateLayout || "bilingual",
        });

        try {
          const fr = JSON.parse(model.servicesFr || "[]");
          const ar = JSON.parse(model.servicesAr || "[]");
          const parsed = fr.map((frService: string, idx: number) => ({
            fr: frService,
            ar: ar[idx] || "",
          }));

          if (parsed.length > 0) {
            setServices(parsed);
          }
        } catch (err) {
          console.warn("Couldn't parse services:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching prescription model:", error);
      toast.error("Impossible de charger le modèle d'ordonnance.");
    }
  };

  const loadData = useCallback(async () => {
    setIsFetching(true);
    await Promise.all([fetchImage(), fetchModel()]);
    setIsFetching(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Arabic validation is now just rendering a warning in the UI 
    // rather than completely blocking state updates.
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldValueChange = (key: keyof FormState, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleLayoutChange = (layout: TemplateLayout) => {
    setForm(f => ({ ...f, templateLayout: layout }));
  };

  const addService = () => {
    if (services.length < 3) {
      setServices([...services, { fr: "", ar: "" }]);
    }
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      const updated = [...services];
      updated.splice(index, 1);
      setServices(updated);
    }
  };

  const handleServiceChange = (
    index: number,
    lang: "fr" | "ar",
    value: string,
  ) => {
    const updated = [...services];
    // Arabic validation handled visually in the component
    updated[index][lang] = value;
    setServices(updated);
  };

  const fileUploaderProps = useFileUploader();

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form, services };
      const { data: result } = await api.post("/settings/prescription-model", payload);
      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        if (result.model) {
          setForm((prev) => ({
            ...prev,
            ...result.model,
          }));
          if (result.model.services) {
            setServices(result.model.services);
          }
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={isFetching || isSaving}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </Button>
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
                  setFieldValue={handleFieldValueChange}
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
