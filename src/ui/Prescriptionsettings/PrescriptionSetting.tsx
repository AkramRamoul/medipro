import { useEffect, useState } from "react";
import { useFileUploader } from "../hooks/use-file-uploader";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { FileDropzone } from "../components/File-DropZone";
import { RoundedTool } from "../components/Rounded-tool";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import PrintButton from "./EmptyPrintButton";
import { PrescriptionPreview } from "./PrescriptionPreview";
import {
  User,
  Stethoscope,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Info,
  Hash,
  Layout,
  Type,
  Eye,
  EyeOff,
  Minus,
  SlidersHorizontal,
  Globe,
  Languages,
  Check,
} from "lucide-react";
import api from "../axios";

interface FormState {
  nameFr: string;
  nameAr: string;
  specialtyFr: string;
  specialtyAr: string;
  servicesFr: string;
  servicesAr: string;
  inscriptionNumber: string;
  address: string;
  phoneNumber1: string;
  phoneNumber2: string;
  city: string;
  accentColor?: string;
  fontFamily?: "serif" | "sans-serif";
  doctorNameFontSize?: number;
  specialtyFontSize?: number;
  titleFontSize?: number;
  bodyFontSize?: number;
  logoSize?: number;
  watermarkOpacity?: number;
  dividerStyle?: "solid" | "dashed" | "double" | "none";
  titleText?: string;
  showInscriptionNumber?: boolean;
  layoutTemplate?: string;
  languageMode?: "bilingual" | "fr" | "ar";
}

export function PrescriptionModelForm() {
  const [form, setForm] = useState<FormState>({
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
    layoutTemplate: "standard",
    languageMode: "bilingual",
  });

  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [services, setServices] = useState([{ fr: "", ar: "" }]);

  const fetchImage = async () => {
    try {
      const { data } = await api.get('/settings/logo');
      if (data.success && data.image) {
        setLogoImage(data.image);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };

  const fetchModel = async () => {
    try {
      const { data } = await api.get('/settings/prescription-model');
      if (data.success && data.model) {
        const model = data.model;

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
          layoutTemplate: model.layoutTemplate || "standard",
          languageMode: model.languageMode || "bilingual",
        });

        if (model.services) {
          setServices(model.services);
        }
      }
    } catch (error) {
      console.error("Error fetching model:", error);
    }
  };

  useEffect(() => {
    fetchImage();
    fetchModel();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const arabicRegex = /^[\u0600-\u06FF\s\u0660-\u0669.,،ء-ي]*$/;

    if (
      (name === "nameAr" || name === "specialtyAr" || name === "servicesAr") &&
      value !== "" &&
      !arabicRegex.test(value)
    ) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
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
    if (lang === "ar") {
      const arabicRegex = /^[\u0600-\u06FF\s\u0660-\u0669.,،ء-ي]*$/;
      if (value !== "" && !arabicRegex.test(value)) return;
    }
    updated[index][lang] = value;
    setServices(updated);
  };

  const fileUploaderProps = useFileUploader();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...form, services };
    try {
      const { data: result } = await api.post('/settings/prescription-model', payload);
      if (result.success) {
        toast.success("Modèle enregistré avec succès !");
        // No need to spread result.model if the API returns just success
        // But if it does return the model, we can update it
        if (result.model) {
          setForm((prev) => ({
            ...prev,
            ...result.model,
          }));
          setServices(result.model.services);
        }
      }
    } catch (error) {
      console.error("Error saving model:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Form */}
        <div className="space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-xl">Concevez votre ordonnance</CardTitle>
                  <CardDescription>
                    Personnalisez l'en-tête et le pied de page de vos ordonnances.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Template & Language Section — TOP OF FORM */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                    <Globe className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Modèle et Langue</h3>
                  </div>

                  {/* Language Mode */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Languages className="w-4 h-4 text-primary" /> Mode de Langue
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "fr" as const, label: "Français", desc: "Français uniquement" },
                        { id: "ar" as const, label: "العربية", desc: "Arabe uniquement" },
                        { id: "bilingual" as const, label: "Bilingue", desc: "Français + Arabe" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, languageMode: lang.id }))}
                          className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-sm font-medium ${form.languageMode === lang.id
                              ? "bg-primary/10 border-primary text-primary shadow-md"
                              : "bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/30"
                            }`}
                        >
                          {form.languageMode === lang.id && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <span className="text-base font-bold">{lang.label}</span>
                          <span className="text-[10px] text-muted-foreground">{lang.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layout Template */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Layout className="w-4 h-4 text-primary" /> Disposition du Logo
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "standard", label: "Centré" },
                        { id: "logo-left", label: "Gauche" },
                        { id: "logo-right", label: "Droite" },
                      ].map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, layoutTemplate: tmpl.id }))}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-xs font-medium ${form.layoutTemplate === tmpl.id
                              ? "bg-primary/10 border-primary text-primary shadow-md"
                              : "bg-muted/20 border-muted text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/30"
                            }`}
                        >
                          {form.layoutTemplate === tmpl.id && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          {/* Mini preview thumbnail */}
                          <div className="w-full h-12 bg-muted/40 rounded relative overflow-hidden border border-muted">
                            {/* Logo dot */}
                            {tmpl.id === "standard" && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/50 rounded-full" />}
                            {tmpl.id === "logo-left" && <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-primary/50 rounded-full" />}
                            {tmpl.id === "logo-right" && <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary/50 rounded-full" />}
                            {/* Text lines */}
                            {tmpl.id === "standard" && (
                              <>
                                <div className="absolute top-2 left-1 w-6 space-y-0.5">
                                  <div className="h-[2px] bg-gray-400 rounded" />
                                  <div className="h-[2px] bg-gray-300 rounded w-4" />
                                </div>
                                <div className="absolute top-2 right-1 w-6 space-y-0.5">
                                  <div className="h-[2px] bg-gray-400 rounded" />
                                  <div className="h-[2px] bg-gray-300 rounded w-4 ml-auto" />
                                </div>
                              </>
                            )}
                            {tmpl.id === "logo-left" && (
                              <div className="absolute top-2 left-8 right-1 space-y-0.5">
                                <div className="h-[2px] bg-gray-400 rounded w-full" />
                                <div className="h-[2px] bg-gray-300 rounded w-3/4" />
                              </div>
                            )}
                            {tmpl.id === "logo-right" && (
                              <div className="absolute top-2 left-1 right-8 space-y-0.5">
                                <div className="h-[2px] bg-gray-400 rounded w-full" />
                                <div className="h-[2px] bg-gray-300 rounded w-3/4" />
                              </div>
                            )}
                            {/* Divider */}
                            <div className="absolute bottom-2 left-1 right-1 h-[1px] bg-gray-300" />
                          </div>
                          <span>{tmpl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Doctor Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Informations du Docteur</h3>
                  </div>
                  <div className={`grid gap-4 ${form.languageMode === "bilingual" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                    {(form.languageMode === "fr" || form.languageMode === "bilingual") && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nom (Français)</label>
                        <input
                          placeholder="Dr. Nom Prénom"
                          type="text"
                          name="nameFr"
                          value={form.nameFr}
                          onChange={handleChange}
                          className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    )}
                    {(form.languageMode === "ar" || form.languageMode === "bilingual") && (
                      <div className="space-y-2 text-right" dir="rtl">
                        <label className="text-sm font-medium">اسم الطبيب</label>
                        <input
                          type="text"
                          maxLength={50}
                          name="nameAr"
                          placeholder="الدكتور(ة) اسم الطبيب"
                          value={form.nameAr}
                          onChange={handleChange}
                          className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  <div className={`grid gap-4 text-xs ${form.languageMode === "bilingual" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                    {(form.languageMode === "fr" || form.languageMode === "bilingual") && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Spécialité (Français)</label>
                        <input
                          maxLength={50}
                          type="text"
                          placeholder="Ex: Dermatologue"
                          name="specialtyFr"
                          value={form.specialtyFr}
                          onChange={handleChange}
                          className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    )}
                    {(form.languageMode === "ar" || form.languageMode === "bilingual") && (
                      <div className="space-y-2 text-right" dir="rtl">
                        <label className="text-sm font-medium">التخصص</label>
                        <input
                          type="text"
                          name="specialtyAr"
                          placeholder="مثال: أمراض الجلد"
                          value={form.specialtyAr}
                          onChange={handleChange}
                          className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Services Section */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-muted">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm uppercase tracking-wider">Services & Expertise</h3>
                    </div>
                    {services.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={addService}
                      >
                        <Plus className="w-3 h-3" /> Ajouter
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="relative group p-4 border rounded-lg bg-muted/20 space-y-4"
                      >
                        {services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className={`grid gap-4 ${form.languageMode === "bilingual" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                          {(form.languageMode === "fr" || form.languageMode === "bilingual") && (
                            <textarea
                              placeholder="Service (FR)"
                              value={service.fr}
                              onChange={(e) => handleServiceChange(index, "fr", e.target.value)}
                              className="w-full p-2 border rounded-md bg-background text-sm resize-none"
                              rows={2}
                            />
                          )}
                          {(form.languageMode === "ar" || form.languageMode === "bilingual") && (
                            <textarea
                              placeholder="الخدمة (AR)"
                              value={service.ar}
                              onChange={(e) => handleServiceChange(index, "ar", e.target.value)}
                              className="w-full p-2 border rounded-md bg-background text-sm text-right resize-none"
                              rows={2}
                              dir="rtl"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Registration & Contact */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Contact & Inscription</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Hash className="w-3 h-3" /> N° d'ordre
                        </label>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, showInscriptionNumber: !f.showInscriptionNumber }))}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title={form.showInscriptionNumber ? "Masquer sur l'impression" : "Afficher sur l'impression"}
                        >
                          {form.showInscriptionNumber ? (
                            <Eye className="w-4 h-4 text-primary" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        name="inscriptionNumber"
                        value={form.inscriptionNumber}
                        onChange={handleChange}
                        placeholder="Ex: 12345"
                        className="w-full p-2.5 border rounded-md bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Ex: Alger"
                        className="w-full p-2.5 border rounded-md bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adresse complète</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Rue, Quartier, Bâtiment..."
                      className="w-full p-2.5 border rounded-md bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Tél Fixe
                      </label>
                      <input
                        type="text"
                        name="phoneNumber1"
                        value={form.phoneNumber1}
                        onChange={handleChange}
                        placeholder="021 XX XX XX"
                        className="w-full p-2.5 border rounded-md bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Mobile
                      </label>
                      <input
                        type="text"
                        name="phoneNumber2"
                        value={form.phoneNumber2}
                        onChange={handleChange}
                        placeholder="05XX XX XX XX"
                        className="w-full p-2.5 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                </section>

                {/* Personalization Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <Layout className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Personnalisation Visuelle</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Couleur d'accentuation</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="accentColor"
                          value={form.accentColor}
                          onChange={handleChange}
                          className="w-12 h-12 p-1 rounded-md cursor-pointer border shadow-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          {["#000000", "#2563eb", "#16a34a", "#dc2626", "#7c3aed"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, accentColor: color }))}
                              className={`w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110 ${form.accentColor === color ? 'scale-125 ring-primary' : ''}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Cette couleur sera utilisée pour votre nom et le titre "ORDONNANCE".
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Style d'écriture</label>
                      <div className="flex p-1 bg-muted rounded-lg w-full max-w-[200px]">
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, fontFamily: "serif" }))}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${form.fontFamily === "serif" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Classique (Serif)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, fontFamily: "sans-serif" }))}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${form.fontFamily === "sans-serif" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Moderne (Sans)
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Layout & Sizing Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Mise en Page</h3>
                  </div>

                  {/* Font Sizes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Type className="w-3.5 h-3.5 text-muted-foreground" />
                      <label className="text-sm font-medium">Tailles de police</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {([
                        { key: "doctorNameFontSize" as const, label: "Nom du docteur", min: 10, max: 22 },
                        { key: "specialtyFontSize" as const, label: "Spécialité", min: 8, max: 16 },
                        { key: "titleFontSize" as const, label: "Titre (ORDONNANCE)", min: 14, max: 28 },
                        { key: "bodyFontSize" as const, label: "Corps de texte", min: 8, max: 16 },
                      ]).map(({ key, label, min, max }) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{form[key]}px</span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            value={form[key]}
                            onChange={(e) => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logo & Watermark */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Taille du logo</span>
                        <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{form.logoSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={40}
                        max={120}
                        value={form.logoSize}
                        onChange={(e) => setForm(f => ({ ...f, logoSize: Number(e.target.value) }))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Opacité du filigrane</span>
                        <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{form.watermarkOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={form.watermarkOpacity}
                        onChange={(e) => setForm(f => ({ ...f, watermarkOpacity: Number(e.target.value) }))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Divider Style */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Minus className="w-3 h-3" /> Style du séparateur
                    </label>
                    <div className="flex p-1 bg-muted rounded-lg w-full max-w-xs">
                      {([
                        { value: "solid" as const, label: "Continu" },
                        { value: "dashed" as const, label: "Tirets" },
                        { value: "double" as const, label: "Double" },
                        { value: "none" as const, label: "Aucun" },
                      ]).map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, dividerStyle: value }))}
                          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${form.dividerStyle === value
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title Text & Show N° */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Texte du titre</label>
                      <input
                        type="text"
                        value={form.titleText}
                        onChange={(e) => setForm(f => ({ ...f, titleText: e.target.value }))}
                        placeholder="ORDONNANCE"
                        className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Old template section removed — now at top of form */}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 h-11 text-lg font-semibold">
                    Enregistrer les modifications
                  </Button>
                  {form && <PrintButton model={form} image={logoImage} />}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Logo Upload Section */}
          <Card className="shadow-md border-primary/5">
            <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Logo de la Clinique
            </CardHeader>
            <CardContent>
              <FileDropzone
                setCurrentFile={fileUploaderProps.handleFileUpload}
                acceptedFileTypes={["image/*"]}
                dropText="Cliquez ou glissez votre logo ici"
              >
                <RoundedTool
                  onImageUploaded={setLogoImage}
                  existingImage={logoImage}
                />
              </FileDropzone>
              <div className="mt-4 flex items-start gap-2 text-[10px] text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p>
                  Conseil : Utilisez une image haute résolution avec un fond transparent (PNG) ou blanc
                  pour un rendu optimal sur vos ordonnances imprimées. Le logo sera placé au centre de l'en-tête.
                </p>
              </div>
            </CardContent>
          </Card>
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
