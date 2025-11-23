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
  patientName: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  reportDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  chiefComplaint: z.string().min(1, {
    message: "Chief complaint is required.",
  }),
  historyOfPresentIllness: z.string().optional(),
  examinationFindings: z.string().min(1, {
    message: "Examination findings are required.",
  }),
  diagnosis: z.string().min(1, {
    message: "Diagnosis is required.",
  }),
  treatmentPlan: z.string().min(1, {
    message: "Treatment plan is required.",
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
      patientName: "",
      reportDate: new Date().toISOString().split("T")[0],
      chiefComplaint: "",
      historyOfPresentIllness: "",
      examinationFindings: "",
      diagnosis: "",
      treatmentPlan: "",
    },
  });

  async function onSubmit(values: z.infer<typeof medicalReportSchema>) {
    console.log(values);
    try {
      await window.electronAPI.createDocument({
        patientId,
        type: type === "CERTIFICATE" ? "certificate" : "report",
        content: values,
      });
      refreshDocuments();
      onClose();
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Medical Report</CardTitle>
        <CardDescription>
          Create a comprehensive medical report.
        </CardDescription>
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
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Date</FormLabel>
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
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chest pain, Fever" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="historyOfPresentIllness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>History of Present Illness</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed history..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="examinationFindings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examination Findings</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Physical examination results..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acute Bronchitis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatmentPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Medications, lifestyle changes, follow-up..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Save Report</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
