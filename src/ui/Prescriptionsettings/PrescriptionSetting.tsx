import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import useSWR from "swr";
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

import { useDebounce } from "../hooks/use-debounce";
import { FormState, ServiceItem, FormData } from "./types";
import { TemplateLayoutSelector } from "./components/TemplateLayoutSelector";
import { DoctorInfoSection } from "./components/DoctorInfoSection";
import { ServicesSection } from "./components/ServicesSection";
import { ContactAndRegistration } from "./components/ContactAndRegistration";
import { VisualAndLayoutSettings } from "./components/VisualAndLayoutSettings";
import { LogoUploadSection } from "./components/LogoUploadSection";

const DEFAULT_FORM: FormState = {
  nameFr: "Dr. Rayan Ramoul",
  nameAr: "د. ريان رمول",
  specialtyFr: "Spécialiste en Cardiologie",
  specialtyAr: "أخصائي أمراض القلب والشرايين",
  servicesFr: "",
  servicesAr: "",
  inscriptionNumber: "12345/2026",
  address: "123 Boulevard de l'Avenir, Centre Médical",
  phoneNumber1: "05 55 12 34 56",
  phoneNumber2: "06 66 98 76 54",
  city: "Alger",
  accentColor: "#2563eb",
  fontFamily: "inter",
  doctorNameFontSize: 16,
  specialtyFontSize: 11,
  titleFontSize: 20,
  bodyFontSize: 12,
  logoSize: 60,
  watermarkOpacity: 8,
  dividerStyle: "solid",
  titleText: "ORDONNANCE",
  showInscriptionNumber: true,
  templateLayout: "bilingual-logo-left",
};

const DEFAULT_SERVICES: ServiceItem[] = [
  { fr: "Échocardiographie Doppler", ar: "تخطيط صدى القلب دوبلر" },
  { fr: "Électrocardiogramme (ECG)", ar: "تخطيط كهربية القلب" },
  { fr: "Holter Rythmique", ar: "جهاز هولتر لمراقبة النبض" },
];

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function PrescriptionModelForm() {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader();
  const [isSaving, setIsSaving] = useState(false);

  const { data: logoData, isLoading: isFetchingLogo } = useSWR('/settings/logo', fetcher, { revalidateOnFocus: false });
  const { data: modelData, isLoading: isFetchingModel, mutate: mutateModel } = useSWR('/settings/prescription-model', fetcher, { revalidateOnFocus: false });

  const methods = useForm<FormData>({
    defaultValues: { ...DEFAULT_FORM, services: DEFAULT_SERVICES }
  });

  const { reset, handleSubmit, watch } = methods;

  useEffect(() => {
    if (logoData?.success && logoData.image) {
      setLogoImage(logoData.image);
    }
  }, [logoData]);

  useEffect(() => {
    if (modelData?.success && modelData.model) {
      const model = modelData.model;
      let parsedServices = DEFAULT_SERVICES;
      try {
        const fr: string[] = JSON.parse(model.servicesFr || "[]");
        const ar: string[] = JSON.parse(model.servicesAr || "[]");
        const parsed = fr.map((f, i) => ({ fr: f, ar: ar[i] || "" }));
        if (parsed.length > 0) parsedServices = parsed;
      } catch {
        // Ignore malformed service data
      }
      reset({ ...DEFAULT_FORM, ...model, services: parsedServices });
    }
  }, [modelData, reset]);

  const watchedValues = watch();
  const debouncedForm = useDebounce(watchedValues, 300);

  const handleReset = () => {
    reset({ ...DEFAULT_FORM, services: DEFAULT_SERVICES });
  };

  const handleReload = () => {
    mutateModel();
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const { data: result } = await api.post("/settings/prescription-model", data);
      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        mutateModel(); // Refetch to ensure form matches server state
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

  const isFetching = isFetchingLogo || isFetchingModel;

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
                    onClick={handleReload}
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
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <TemplateLayoutSelector />
                  <DoctorInfoSection />
                  <ServicesSection />
                  <ContactAndRegistration />
                  <VisualAndLayoutSettings />

                  <div className="flex gap-4 pt-4">
                    <Button disabled={isSaving} type="submit" className="flex-1 h-11 text-lg font-semibold">
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Enregistrer les modifications
                    </Button>
                    <PrintButton model={debouncedForm} image={logoImage} />
                  </div>
                </form>
              </FormProvider>
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
            form={debouncedForm}
            services={debouncedForm.services || []}
            logoImage={logoImage}
          />
        </div>
      </div>
    </div>
  );
}
