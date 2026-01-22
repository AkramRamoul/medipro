"use client";

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

export function PrescriptionModelForm() {
  const [form, setForm] = useState({
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
  });

  const [logoImage, setLogoImage] = useState<string | null>(null);

  const [services, setServices] = useState([{ fr: "", ar: "" }]);

  const fetchImage = async () => {
    const result = await window.electronAPI.getImage();
    if (result.success && result.image) {
      setLogoImage(result.image);
    }
  };
  useEffect(() => {
    fetchImage();
  }, []);
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
    fetchModel();
  }, []);

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
  }

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

    setForm((prev: FormState) => ({ ...prev, [name]: value }));
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
    <div className="relative min-h-screen py-8">
      <Card
        className="w-full px-4 sm:px-6 lg:px-8 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto bg-card text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Concevez votre ordonnance
            </CardTitle>
            <CardDescription className="text-center">
              Remplissez le formulaire ci-dessous pour concevoir votre
              ordonnance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-1">
              {/* Name fields */}
              <div>
                <label className="block font-medium">
                  Nom du docteur / clinique (Français)
                </label>
                <input
                  placeholder="Dr. Nom Prénom / Nom de la clinique"
                  type="text"
                  name="nameFr"
                  value={form.nameFr}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                />
              </div>
              <div>
                <label className="block font-medium">
                  اسم الطبيب / العيادة (العربية)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  name="nameAr"
                  placeholder="الدكتور(ة) اسم الطبيب / اسم العيادة"
                  value={form.nameAr}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2 text-right"
                  dir="rtl"
                />
              </div>
              {/* Specialty fields */}
              <div>
                <label className="block font-medium">
                  Spécialité (Français)
                </label>
                <input
                  maxLength={50}
                  type="text"
                  placeholder="Exemple: Docteur Spécialiste en Dermatologie"
                  name="specialtyFr"
                  value={form.specialtyFr}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                />
              </div>
              <div>
                <label className="block font-medium">التخصص (العربية)</label>
                <input
                  type="text"
                  name="specialtyAr"
                  placeholder="مثال: دكتور(ة) متخصص(ة) في الأمراض الجلدية"
                  value={form.specialtyAr}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2 text-right"
                  dir="rtl"
                />
              </div>
              {/* Services */}
              {services.map((service, index) => (
                <div
                  key={index}
                  className="mb-6 border border-border p-4 rounded-lg bg-card text-card-foreground shadow-sm"
                >
                  <div className="mb-4">
                    <label className="block font-medium">
                      Services (Français) {index + 1}
                    </label>
                    <textarea
                      placeholder="Exemple: Maladie de Peau et des Ongles"
                      value={service.fr}
                      onChange={(e) =>
                        handleServiceChange(index, "fr", e.target.value)
                      }
                      className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block font-medium">
                      الخدمات (العربية) {index + 1}
                    </label>
                    <textarea
                      placeholder="مثال: أمراض الجلد والأظافر"
                      value={service.ar}
                      onChange={(e) =>
                        handleServiceChange(index, "ar", e.target.value)
                      }
                      className="w-full p-2 border border-input bg-background text-foreground rounded mt-2 text-right"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-destructive hover:underline"
                      >
                        Supprimer / حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Add service */}
              <div className="mb-4">
                {services.length < 3 && (
                  <Button
                    type="button"
                    className="bg-primary text-primary-foreground font-semibold"
                    onClick={addService}
                  >
                    + Ajouter un service
                  </Button>
                )}
              </div>
              {/* Registration fields */}
              <div>
                <label className="block font-medium">N° d'inscription</label>
                <input
                  type="text"
                  name="inscriptionNumber"
                  value={form.inscriptionNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                />
              </div>
              <div>
                <label className="block font-medium">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                  placeholder="Votre adresse ici"
                />
              </div>
              <div>
                <label className="block font-medium">Ville</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                  placeholder="Votre ville"
                />
              </div>
              <div>
                <label className="block font-medium">
                  Num Tel Fix (si existe)
                </label>
                <input
                  type="text"
                  name="phoneNumber1"
                  value={form.phoneNumber1}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                  placeholder="Ex: 0555 55 55 55"
                />
              </div>
              <div>
                <label className="block font-medium">Num Mobile</label>
                <input
                  type="text"
                  name="phoneNumber2"
                  value={form.phoneNumber2}
                  onChange={handleChange}
                  className="w-full p-2 border border-input bg-background text-foreground rounded mt-2"
                  placeholder="Ex: 0777 77 77 77"
                />
              </div>
              {/* Submit */}
              <Button
                type="submit"
                className="bg-primary text-primary-foreground font-semibold p-2 text-md"
              >
                Soumettre / إرسال
              </Button>
            </div>
          </CardContent>
        </form>
        <div className="mt-4">
          <FileDropzone
            setCurrentFile={fileUploaderProps.handleFileUpload}
            acceptedFileTypes={["image/*", "application/pdf"]}
            dropText="Faites glisser et déposez un fichier ici ou cliquez pour télécharger"
          >
            <RoundedTool onImageUploaded={setLogoImage} />
          </FileDropzone>
          <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Utilisez une image avec un fond blanc ou transparent pour un meilleur rendu.
          </p>
        </div>
      </Card>

      {form && <PrintButton model={form} image={logoImage} />}
    </div>
  );
}
