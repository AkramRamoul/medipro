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

function MainPage() {
  const { id } = useParams<{ id: string }>();
  const { exportPdf, isExporting } = usePatientPdfExport();

  return (
    <div className="p-4 flex flex-col items-center">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-3 gap-4">
          <TabsList className="flex-1 flex justify-center bg-muted rounded-lg">
            <TabsTrigger
              value="example"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Détails du patient
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Consultation
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ordonnance & Documents
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

          <Button
            onClick={() => id && exportPdf(id)}
            disabled={isExporting}
            variant="outline"
            size="default"
            className="flex items-center gap-2 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm font-semibold whitespace-nowrap"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Export..." : "Exporter PDF"}
          </Button>
        </div>

        <TabsContent
          value="example"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <EditPatientForm id={id!} />
        </TabsContent>
        <TabsContent
          value="account"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <ConsultationForm id={id!} />
        </TabsContent>
        <TabsContent
          value="password"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <MainPrescriptionPage id={id!} />
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
