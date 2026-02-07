import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "../Consultation/MainConsultationPage";
import { useParams } from "react-router-dom";
import MainPrescriptionPage from "../Prescription/MainPrescriptionPage";
import { EditPatientForm } from "./EditPatientForm";
import TimeLine from "../Timeline/TimeLine";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import { usePatientPdfExport } from "../../hooks/usePatientPdfExport";
import { AppointmentTab } from "../Appointment/AppointmentTab";
import { VitalSignsChart } from "./VitalSignsChart";

function MainPage() {
  const { id } = useParams<{ id: string }>();
  const { exportPdf, isExporting } = usePatientPdfExport();

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dossier Patient
        </h1>
        <Button
          onClick={() => id && exportPdf(id)}
          disabled={isExporting}
          variant="default"
          size="default"
          className="flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Export..." : "Exporter PDF"}
        </Button>
      </div>

      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <div className="mb-3">
          <TabsList className="w-full flex justify-center bg-muted rounded-lg h-auto p-1">
            <TabsTrigger
              value="example"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Détails du patient
            </TabsTrigger>
            <TabsTrigger
              value="vitals"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Signes Vitaux
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Consultation
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ordonnances
            </TabsTrigger>
            <TabsTrigger
              value="letters"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Lettres
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Historique
            </TabsTrigger>
            <TabsTrigger
              value="rendezyous"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Rendez-vous
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="example"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <EditPatientForm id={id!} />
        </TabsContent>
        <TabsContent
          value="vitals"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <VitalSignsChart patientId={id!} />
        </TabsContent>
        <TabsContent
          value="account"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <ConsultationForm id={id!} />
        </TabsContent>
        <TabsContent
          value="prescriptions"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <MainPrescriptionPage id={id!} mode="prescriptions" />
        </TabsContent>
        <TabsContent
          value="letters"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <MainPrescriptionPage id={id!} mode="letters" />
        </TabsContent>
        <TabsContent
          value="timeline"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <TimeLine id={id!} />
        </TabsContent>

        <TabsContent
          value="rendezyous"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <AppointmentTab patientId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
