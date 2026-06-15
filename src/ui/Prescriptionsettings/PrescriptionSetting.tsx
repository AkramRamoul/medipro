import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import useSWR from "swr";
import { useFileUploader } from "../hooks/use-file-uploader";
import api from "../axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { PrescriptionPreview } from "./PrescriptionPreview";
import {
  Layout, RefreshCw, Loader2, Save,
  CheckCircle2, AlertCircle, User,
  Phone, Palette, Image as ImageIcon, Layers,
  FileText, ChevronDown,
} from "lucide-react";

import { useDebounce } from "../hooks/use-debounce";
import { FormState, ServiceItem, FormData } from "./types";
import { TemplateLayoutSelector } from "./components/TemplateLayoutSelector";
import { DoctorInfoSection } from "./components/DoctorInfoSection";
import { ServicesSection } from "./components/ServicesSection";
import { ContactAndRegistration } from "./components/ContactAndRegistration";
import { VisualAndLayoutSettings } from "./components/VisualAndLayoutSettings";
import { LogoUploadSection } from "./components/LogoUploadSection";
import PrintButton from "./EmptyPrintButton";

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

const DEFAULT_SERVICES: ServiceItem[] = [];

const fetcher = (url: string) => api.get(url).then(res => res.data);

// ── Accordion Section ────────────────────────────────────────────────────────
function AccordionSection({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header – clickable trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors duration-150 text-left"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 bg-primary/8 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground ml-1 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Collapsible body */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Form ───────────────────────────────────────────────────────────────
export function PrescriptionModelForm() {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { data: logoData, isLoading: isFetchingLogo } = useSWR('/settings/logo', fetcher, { revalidateOnFocus: false });
  const { data: modelData, isLoading: isFetchingModel, mutate: mutateModel } = useSWR('/settings/prescription-model', fetcher, { revalidateOnFocus: false });

  const methods = useForm<FormData>({
    defaultValues: { ...DEFAULT_FORM, services: DEFAULT_SERVICES }
  });

  const { reset, handleSubmit, watch, formState: { isDirty } } = methods;

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
    }
  }, [modelData, reset]);

  const watchedValues = watch();
  const debouncedForm = useDebounce(watchedValues, 300);

  const handleReload = () => {
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
    } else {
      reset({ ...DEFAULT_FORM, services: DEFAULT_SERVICES });
    }
    mutateModel();
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const { data: result } = await api.post("/settings/prescription-model", data);
      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        setLastSaved(new Date());
        reset(data);
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Chargement en cours</p>
          <p className="text-xs text-muted-foreground mt-0.5">Récupération des paramètres du modèle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight tracking-tight">Modèle d'ordonnance</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personnalisez l'en-tête, le design et le pied de page de vos ordonnances.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Status indicator */}
              {isDirty ? (
                <span className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Modifications non enregistrées
                </span>
              ) : lastSaved ? (
                <span className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Enregistré à {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReload}
                disabled={isSaving}
                className="gap-1.5 h-8 text-xs"
                title="Recharger les données enregistrées"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Recharger</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── Left: Form ─────────────────────────────────────────────── */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <AccordionSection
                title="Modèle de mise en page"
                icon={<Layers className="w-4 h-4" />}
                badge="Requis"
                defaultOpen
              >
                <TemplateLayoutSelector />
              </AccordionSection>

              <AccordionSection
                title="Logo du cabinet"
                icon={<ImageIcon className="w-4 h-4" />}
                defaultOpen
              >
                <LogoUploadSection
                  logoImage={logoImage}
                  setLogoImage={setLogoImage}
                  handleFileUpload={fileUploaderProps.handleFileUpload}
                />
              </AccordionSection>

              <AccordionSection
                title="Informations du Docteur"
                icon={<User className="w-4 h-4" />}
                badge="Requis"
                defaultOpen
              >
                <DoctorInfoSection />
              </AccordionSection>

              <AccordionSection
                title="Services & Actes"
                icon={<FileText className="w-4 h-4" />}
              >
                <ServicesSection />
              </AccordionSection>

              <AccordionSection
                title="Contact & Inscription"
                icon={<Phone className="w-4 h-4" />}
              >
                <ContactAndRegistration />
              </AccordionSection>

              <AccordionSection
                title="Personnalisation Visuelle"
                icon={<Palette className="w-4 h-4" />}
              >
                <VisualAndLayoutSettings />
              </AccordionSection>

              {/* ── Save button ──────────────────────────────────────── */}
              <div className="pt-2 pb-8">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-11 text-sm font-semibold gap-2 rounded-xl shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>

            </form>
          </FormProvider>

          {/* ── Right: Sticky Preview ────────────────────────────────── */}
          <div className="xl:sticky xl:top-[73px] space-y-3">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Preview header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/20">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-muted-foreground ml-2 tracking-wide">Aperçu en direct</span>
                <span className="ml-auto text-[10px] text-muted-foreground/60 font-medium italic">Papier A5</span>
              </div>

              {/* Preview body */}
              <div className="p-4">
                <PrescriptionPreview
                  form={debouncedForm}
                  services={debouncedForm.services || []}
                  logoImage={logoImage}
                />
              </div>
            </div>

            {/* Print button */}
            <div className="flex justify-center">
              <PrintButton model={debouncedForm} image={logoImage} />
            </div>

            {/* Hint */}
            <p className="text-[11px] text-muted-foreground/70 text-center px-4 leading-relaxed">
              L'aperçu se met à jour automatiquement à chaque modification.
              L'impression finale sera sur papier A5.
            </p>
          </div>

        </div>
      </div>

      {/* ── Floating unsaved-changes bar ────────────────────────────────── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${isDirty
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <div className="flex items-center gap-3 bg-background/95 dark:bg-card/95 backdrop-blur-md border border-border rounded-2xl px-5 py-3 shadow-2xl shadow-black/10 min-w-[320px]">
          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-muted-foreground flex-1">Modifications non enregistrées</p>
          <Button
            form="prescription-form"
            type="submit"
            disabled={isSaving}
            size="sm"
            className="gap-1.5 h-8 font-semibold rounded-xl text-xs"
            onClick={handleSubmit(onSubmit)}
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

    </div>
  );
}
