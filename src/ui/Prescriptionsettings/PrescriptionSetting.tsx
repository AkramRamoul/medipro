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
  Layout
} from "lucide-react";

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
  });

  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [services, setServices] = useState([{ fr: "", ar: "" }]);

  const fetchImage = async () => {
    const result = await window.electronAPI.getImage();
    if (result.success && result.image) {
      setLogoImage(result.image);
    }
  };

  const fetchModel = async () => {
    const result = await window.electronAPI.getPrescriptionModel();
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
    const result = await window.electronAPI.savePrescriptionModel(payload);
    if (result.success) {
      toast.success("Modèle enregistré avec succès !");
      setForm((prev) => ({
        ...prev,
        ...result.model,
      }));
      setServices(result.model.services);
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
                {/* Doctor Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Informations du Docteur</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <textarea
                            placeholder="Service (FR)"
                            value={service.fr}
                            onChange={(e) => handleServiceChange(index, "fr", e.target.value)}
                            className="w-full p-2 border rounded-md bg-background text-sm resize-none"
                            rows={2}
                          />
                          <textarea
                            placeholder="الخدمة (AR)"
                            value={service.ar}
                            onChange={(e) => handleServiceChange(index, "ar", e.target.value)}
                            className="w-full p-2 border rounded-md bg-background text-sm text-right resize-none"
                            rows={2}
                            dir="rtl"
                          />
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
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Hash className="w-3 h-3" /> N° d'ordre
                      </label>
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
