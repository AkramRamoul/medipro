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

const medicalCertificateSchema = z.object({
  patientName: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  examinationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  diagnosis: z.string().min(1, {
    message: "Diagnosis is required.",
  }),
  restStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  restEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  doctorName: z.string().min(2, {
    message: "Doctor's name is required.",
  }),
  remarks: z.string().optional(),
});

export function MedicalCertificate({
  patientId,
  onClose,
  type,
  refreshDocuments,
}: {
  patientId: string;
  onClose: () => void;
  type: "CERTIFICATE" | "REPORT";
  refreshDocuments: () => void;
}) {
  const form = useForm<z.infer<typeof medicalCertificateSchema>>({
    resolver: zodResolver(medicalCertificateSchema),
    defaultValues: {
      patientName: "",
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "CERTIFICATE" ? "Medical Certificate" : "Medical Report"}
        </CardTitle>
        <CardDescription>
          {type === "CERTIFICATE"
            ? "Issue a medical certificate for a patient."
            : "Create a medical report for a patient."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
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
                  <FormLabel>Examination Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Diagnosis / Condition</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the medical condition..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="restStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rest Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Rest End Date</FormLabel>
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
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional remarks..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">
                {type === "CERTIFICATE"
                  ? "Generate Certificate"
                  : "Generate Report"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
