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
import { Separator } from "../ui/separator";
import {
  FileCheck,
  Activity,
  Calendar,
  User,
  ReceiptText,
  Save,
  X,
} from "lucide-react";
import { Patient } from "../../type";

const medicalCertificateSchema = z.object({
  patientName: z.string().min(2, {
    message: "Le nom du patient doit comporter au moins 2 caractères.",
  }),
  examinationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Veuillez entrer une date valide.",
  }),
  diagnosis: z.string().min(1, {
    message: "Le diagnostic est requis.",
  }),
  restStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Veuillez entrer une date valide.",
  }),
  restEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Veuillez entrer une date valide.",
  }),
  doctorName: z.string().min(2, {
    message: "Le nom du médecin est requis.",
  }),
  remarks: z.string().optional(),
});

export function MedicalCertificate({
  patient,
  onClose,
  type,
  refreshDocuments,
}: {
  patient: Patient;
  onClose: () => void;
  type: "CERTIFICATE" | "REPORT";
  refreshDocuments: () => void;
}) {
  const form = useForm<z.infer<typeof medicalCertificateSchema>>({
    resolver: zodResolver(medicalCertificateSchema),
    defaultValues: {
      patientName: `${patient.last_name} ${patient.first_name}`,
      examinationDate: new Date().toISOString().split("T")[0],
      diagnosis: "",
      restStartDate: new Date().toISOString().split("T")[0],
      restEndDate: "",
      doctorName: "",
      remarks: "",
    },
  });

  async function onSubmit(values: z.infer<typeof medicalCertificateSchema>) {
    console.log(values);
    try {
      await window.electronAPI.createDocument({
        patientId: patient.id,
        type: type === "CERTIFICATE" ? "certificate" : "report",
        content: values,
      });
      refreshDocuments();
      onClose();
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  }

  const isCertificate = type === "CERTIFICATE";
  const title = isCertificate ? "Certificat Médical" : "Rapport Médical";

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none">
      <CardHeader className="pb-4 border-b mb-6">
        <CardTitle className="flex items-center gap-3 text-2xl text-primary">
          <FileCheck className="w-8 h-8" />
          {title}
        </CardTitle>
        <p className="text-muted-foreground mt-1">
          {isCertificate
            ? "Établir un certificat médical pour le patient."
            : "Créer un rapport médical détaillé."}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="examinationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />{" "}
                      Date d'examen
                    </FormLabel>
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
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Diagnostic /
                    Condition
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la condition médicale..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="rounded-lg border p-4 bg-muted/20">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-primary">
                <Calendar className="w-4 h-4" /> Période de Repos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="restStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="restEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-muted-foreground" />{" "}
                      Remarques (Optionnel)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Remarques supplémentaires..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" /> Annuler
              </Button>
              <Button type="submit" className="gap-2 min-w-[150px]">
                <Save className="w-4 h-4" />
                {isCertificate ? "Générer Certificat" : "Générer Rapport"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
