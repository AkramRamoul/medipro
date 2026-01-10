import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  FileText,
  Calendar,
  Activity,
  Pill,
  Stethoscope,
  Save,
  X,
  User,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Patient } from "../../type";

const medicalReportSchema = z.object({
  patientName: z.string().min(2, {
    message: "Le nom du patient doit comporter au moins 2 caractères.",
  }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date invalide.",
  }),
  examenClinique: z.string().min(1, {
    message: "L’examen clinique est requis.",
  }),
  diagnostic: z.string().min(1, {
    message: "Le diagnostic est requis.",
  }),
  traitement: z.string().min(1, {
    message: "Le traitement est requis.",
  }),
});

export function MedicalReport({
  patient,
  type,
  onClose,
  refreshDocuments,
}: {
  patient: Patient;
  type: "CERTIFICATE" | "REPORT";
  onClose: () => void;
  refreshDocuments: () => void;
}) {
  const form = useForm<z.infer<typeof medicalReportSchema>>({
    resolver: zodResolver(medicalReportSchema),
    defaultValues: {
      patientName: `${patient.last_name} ${patient.first_name}`,
      date: new Date().toISOString().split("T")[0],
      examenClinique: "",
      diagnostic: "",
      traitement: "",
    },
  });

  async function onSubmit(values: z.infer<typeof medicalReportSchema>) {
    try {
      await window.electronAPI.createDocument({
        patientId: patient.id,
        type: type === "CERTIFICATE" ? "certificate" : "report",
        content: values,
      });
      refreshDocuments();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création du document :", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none">
      <CardHeader className="pb-4 border-b mb-6">
        <CardTitle className="flex items-center gap-3 text-xl text-primary">
          <FileText className="w-6 h-6" />
          Rapport Médical
        </CardTitle>
        <p className="text-muted-foreground mt-1">
          Rédigez un rapport clinique complet pour le dossier du patient.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Patient
                    </FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />{" "}
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="examenClinique"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-primary">
                      <Stethoscope className="w-5 h-5" /> Examen Clinique
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détails de l'examen clinique, observations..."
                        className="min-h-[120px] bg-muted/30 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="diagnostic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <Activity className="w-4 h-4 text-blue-500" />{" "}
                        Diagnostic
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Diagnostic retenu"
                          {...field}
                          className="bg-muted/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="traitement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <Pill className="w-4 h-4 text-green-500" /> Traitement
                        proposé
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Protocole de soin..."
                          className="min-h-[40px] bg-muted/30 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" /> Annuler
              </Button>
              <Button type="submit" className="gap-2 min-w-[150px]">
                <Save className="w-4 h-4" /> Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
