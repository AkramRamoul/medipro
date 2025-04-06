"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { FileDropzone } from "../File-DropZone";
import { useFileUploader } from "../../hooks/use-file-uploader";
import { RoundedTool } from "../Rounded-tool";

export function PrescriptionModelForm() {
  const [form, setForm] = useState({
    nameFr: "",
    nameAr: "",
    specialtyFr: "",
    specialtyAr: "",
    servicesFr: "",
    servicesAr: "",
    inscriptionNumber: "",
  });

  interface FormState {
    nameFr: string;
    nameAr: string;
    specialtyFr: string;
    specialtyAr: string;
    servicesFr: string;
    servicesAr: string;
    inscriptionNumber: string;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Arabic-only regex: allows Arabic letters, Arabic numerals, spaces, and common punctuation
    const arabicRegex = /^[\u0600-\u06FF\s\u0660-\u0669.,،ء-ي]*$/;

    if (
      (name === "nameAr" || name === "specialtyAr" || name === "servicesAr") &&
      value !== "" &&
      !arabicRegex.test(value)
    ) {
      return; // skip update if value contains non-Arabic characters
    }

    setForm((prev: FormState) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    // Process or store the form data here
  };
  const [services, setServices] = useState([
    { fr: "", ar: "" }, // start with one pair
  ]);

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
    value: string
  ) => {
    const updated = [...services];
    // Optional Arabic-only enforcement
    if (lang === "ar") {
      const arabicRegex = /^[\u0600-\u06FF\s\u0660-\u0669.,،ء-ي]*$/;
      if (value !== "" && !arabicRegex.test(value)) return;
    }
    updated[index][lang] = value;
    setServices(updated);
  };
  const fileUploaderProps = useFileUploader();

  return (
    <Card
      className="w-full px-4 sm:px-6 lg:px-8 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Design your prescription
          </CardTitle>
          <CardDescription className="text-center">
            Fill out the form below to design your prescription.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="border-none">
              <label className="block font-medium">
                Nom du docteur / clinique (Français)
              </label>
              <input
                placeholder="Dr. Nom Prénom / Nom de la clinique"
                type="text"
                name="nameFr"
                value={form.nameFr}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
              />
            </div>
            <div>
              <label className="block font-medium">
                اسم الطبيب / العيادة (العربية)
              </label>
              <input
                type="text"
                name="nameAr"
                placeholder="الدكتور(ة) اسم الطبيب / اسم العيادة"
                value={form.nameAr}
                onChange={handleChange}
                className="w-full p-2 border rounded text-right mt-2"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block font-medium">Spécialité (Français)</label>
              <input
                type="text"
                placeholder="Exemple: Docteur Spécialiste en Dermatologie"
                name="specialtyFr"
                value={form.specialtyFr}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
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
                className="w-full p-2 border rounded text-right mt-2"
                dir="rtl"
              />
            </div>
            {services.map((service, index) => (
              <div key={index} className="mb-6 border p-4 rounded-lg shadow-sm">
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
                    className="w-full p-2 border rounded mt-2"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block font-medium">
                    الخدمات (العربية) {index + 1}
                  </label>
                  <textarea
                    placeholder=" مثال :أمراض الجلد والأظافر "
                    value={service.ar}
                    onChange={(e) =>
                      handleServiceChange(index, "ar", e.target.value)
                    }
                    className="w-full p-2 border rounded mt-2 text-right"
                    rows={2}
                    dir="rtl"
                  />
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer / حذف
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="mb-4">
              {services.length < 3 && (
                <Button
                  className="bg-primary font-semibold"
                  onClick={addService}
                >
                  + Ajouter un service
                </Button>
              )}
            </div>

            <div>
              <label className="block font-medium">
                N° d'inscription (Français seulement)
              </label>
              <input
                type="text"
                name="inscriptionNumber"
                value={form.inscriptionNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-2"
              />
            </div>
            <div>
              <FileDropzone
                setCurrentFile={fileUploaderProps.handleFileUpload}
                acceptedFileTypes={["image/*", "application/pdf"]}
                dropText="Drag and drop a file here or click to upload"
              >
                <RoundedTool />
              </FileDropzone>
            </div>
            <Button
              type="submit"
              className="bg-primary font-semibold p-2 text-md"
            >
              Soumettre / إرسال
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
