import { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import useSWR from "swr";
import { useFileUploader } from "../hooks/use-file-uploader";
import api from "../axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { PrescriptionPreview } from "./PrescriptionPreview";
import {
  Layout, RotateCcw, RefreshCw, Loader2, Save,
  ChevronDown, CheckCircle2, AlertCircle, User,
  Phone, Palette, Image as ImageIcon, Layers,
} from "lucide-react";

import { useDebounce } from "../hooks/use-debounce";
import { FormState, ServiceItem, FormData, DEFAULT_ELEMENT_POSITIONS } from "./types";
import { TemplateLayoutSelector } from "./components/TemplateLayoutSelector";
import { DoctorInfoSection } from "./components/DoctorInfoSection";
import { ServicesSection } from "./components/ServicesSection";
import { ContactAndRegistration } from "./components/ContactAndRegistration";
import { VisualAndLayoutSettings } from "./components/VisualAndLayoutSettings";
import { LogoUploadSection } from "./components/LogoUploadSection";
import PrintButton from "./EmptyPrintButton";

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
  customPositions: DEFAULT_ELEMENT_POSITIONS,
  useCustomLayout: false,
  hiddenElements: [] as import("./types").LayoutElementId[],
};

const DEFAULT_SERVICES: ServiceItem[] = [
  { fr: "Échocardiographie Doppler", ar: "تخطيط صدى القلب دوبلر" },
  { fr: "Électrocardiogramme (ECG)", ar: "تخطيط كهربية القلب" },
  { fr: "Holter Rythmique", ar: "جهاز هولتر لمراقبة النبض" },
];

const fetcher = (url: string) => api.get(url).then(res => res.data);

// ── Accordion Section ──────────────────────────────────────────────────────
function AccordionSection({
  id, title, icon, defaultOpen = false, children,
}: {
  id: string; title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-primary">{icon}</span>
          {title}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 py-4 bg-background border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────────
export function PrescriptionModelForm() {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader();
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { data: logoData, isLoading: isFetchingLogo } = useSWR('/settings/logo', fetcher, { revalidateOnFocus: false });
  const { data: modelData, isLoading: isFetchingModel, mutate: mutateModel } = useSWR('/settings/prescription-model', fetcher, { revalidateOnFocus: false });

  const methods = useForm<FormData>({
    defaultValues: { ...DEFAULT_FORM, services: DEFAULT_SERVICES }
  });

  const { reset, handleSubmit, watch, setValue, formState } = methods;

  useEffect(() => {
    if (logoData?.success && logoData.image) setLogoImage(logoData.image);
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
      } catch { /* ignore */ }
      reset({ ...DEFAULT_FORM, ...model, services: parsedServices });
      setIsDirty(false);
    }
  }, [modelData, reset]);

  // Track dirty state via watch
  useEffect(() => {
    const sub = watch(() => setIsDirty(true));
    return () => sub.unsubscribe();
  }, [watch]);

  const watchedValues = watch();
  const debouncedForm = useDebounce(watchedValues, 300);

  const handleReset = () => {
    reset({ ...DEFAULT_FORM, services: DEFAULT_SERVICES });
    setIsDirty(true);
  };

  const handleReload = () => {
    mutateModel();
    setIsDirty(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const { data: result } = await api.post("/settings/prescription-model", data);
      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        setLastSaved(new Date());
        setIsDirty(false);
        mutateModel();
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-[1400px]">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Modèle d'ordonnance</h1>
            <p className="text-xs text-muted-foreground">
              Personnalisez l'en-tête, le pied de page et le design de vos ordonnances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {isDirty ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <AlertCircle className="w-3 h-3" /> Modifications non enregistrées
            </span>
          ) : lastSaved ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
              <CheckCircle2 className="w-3 h-3" /> Enregistré à {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}

          <Button type="button" variant="ghost" size="sm" onClick={handleReset}
            disabled={isSaving} className="gap-1.5" title="Réinitialiser aux valeurs par défaut">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleReload}
            disabled={isSaving} className="gap-1.5" title="Recharger les données enregistrées">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recharger</span>
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

        {/* Left: Form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <AccordionSection id="template" title="Modèle de mise en page" icon={<Layers className="w-4 h-4" />} defaultOpen>
              <TemplateLayoutSelector />
            </AccordionSection>

            <AccordionSection id="logo" title="Logo du cabinet" icon={<ImageIcon className="w-4 h-4" />} defaultOpen>
              <LogoUploadSection
                logoImage={logoImage}
                setLogoImage={setLogoImage}
                handleFileUpload={fileUploaderProps.handleFileUpload}
              />
            </AccordionSection>

            <AccordionSection id="doctor" title="Informations du Docteur" icon={<User className="w-4 h-4" />} defaultOpen>
              <DoctorInfoSection />
            </AccordionSection>

            <AccordionSection id="services" title="Services & Actes" icon={<Layers className="w-4 h-4" />}>
              <ServicesSection />
            </AccordionSection>

            <AccordionSection id="contact" title="Contact & Inscription" icon={<Phone className="w-4 h-4" />}>
              <ContactAndRegistration />
            </AccordionSection>

            <AccordionSection id="visual" title="Personnalisation Visuelle" icon={<Palette className="w-4 h-4" />}>
              <VisualAndLayoutSettings />
            </AccordionSection>

            {/* ── Sticky save bar ────────────────────────────────────── */}
            <div className={`sticky bottom-4 z-20 transition-all duration-300 ${isDirty ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
              <div className="flex items-center gap-3 bg-background/95 backdrop-blur border border-border rounded-xl px-4 py-3 shadow-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground flex-1">Vous avez des modifications non enregistrées.</p>
                <Button type="submit" disabled={isSaving} size="sm" className="gap-2 font-semibold">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>

            {/* Always-visible save button (fallback when bar is hidden) */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSaving} className="flex-1 h-11 text-base font-semibold gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>

          </form>
        </FormProvider>

        {/* Right: Live preview (sticky) */}
        <div className="lg:sticky lg:top-6">
          <PrescriptionPreview
            form={debouncedForm}
            services={debouncedForm.services || []}
            logoImage={logoImage}
            onCustomLayoutChange={(positions, useCustomLayout, hidden) => {
              setValue("customPositions", positions);
              setValue("useCustomLayout", useCustomLayout);
              setValue("hiddenElements", hidden);
              setIsDirty(true);
            }}
          />
          {/* Print button below preview */}
          <div className="mt-3 flex justify-center">
            <PrintButton model={debouncedForm} image={logoImage} />
          </div>
        </div>

      </div>
    </div>
  );
}
