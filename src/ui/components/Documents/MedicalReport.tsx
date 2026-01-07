import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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

const medicalReportSchema = z.object({
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
  patientId,
  type,
  onClose,
  refreshDocuments,
}: {
  patientId: string;
  type: "CERTIFICATE" | "REPORT";
  onClose: () => void;
  refreshDocuments: () => void;
}) {
  const form = useForm<z.infer<typeof medicalReportSchema>>({
    resolver: zodResolver(medicalReportSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      examenClinique: "",
      diagnostic: "",
      traitement: "",
    },
  });

  async function onSubmit(values: z.infer<typeof medicalReportSchema>) {
    try {
      await window.electronAPI.createDocument({
        patientId,
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Rapport Médical</CardTitle>
        <CardDescription>Création rapide d’un rapport médical.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="examenClinique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examen clinique</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Constatations cliniques..."
                      className="min-h-[90px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnostic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnostic</FormLabel>
                  <FormControl>
                    <Input placeholder="Diagnostic médical" {...field} />
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
                  <FormLabel>Traitement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Médicaments, recommandations..."
                      className="min-h-[90px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
