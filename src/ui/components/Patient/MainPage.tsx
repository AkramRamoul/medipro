import React, { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import { usePatientPdfExport } from "../../hooks/usePatientPdfExport";
import { VitalsTrendCard } from "./VitalsTrendCard";

// Lazy load tab components
const ConsultationForm = React.lazy(() => import("../Consultation/MainConsultationPage"));
const MainPrescriptionPage = React.lazy(() => import("../Prescription/MainPrescriptionPage"));
const EditPatientForm = React.lazy(() => import("./EditPatientForm").then(m => ({ default: m.EditPatientForm })));
const TimeLine = React.lazy(() => import("../Timeline/TimeLine"));
const AppointmentTab = React.lazy(() => import("../Appointment/AppointmentTab").then(m => ({ default: m.AppointmentTab })));
const VitalSignsChart = React.lazy(() => import("./VitalSignsChart").then(m => ({ default: m.VitalSignsChart })));
const LabResultsTab = React.lazy(() => import("./LabResultsTab").then(m => ({ default: m.LabResultsTab })));

const TabLoading = () => (
  <div className="flex items-center justify-center p-12 w-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
  </div>
);

function MainPage() {
  const { id } = useParams<{ id: string }>();
  const { exportPdf, isExporting } = usePatientPdfExport();
  const [activeTab, setActiveTab] = useState("example");

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

      {/* Quick Vitals Overview */}
      <div className="w-full max-w-5xl mb-4">
        <VitalsTrendCard patientId={id!} />
      </div>

      <Tabs defaultValue="example" className="w-full max-w-5xl" onValueChange={setActiveTab}>
        <div className="mb-3">
          <TabsList className="w-full flex justify-center bg-muted rounded-lg h-auto p-1">
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
              value="vitals"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Signes Vitaux
            </TabsTrigger>
            <TabsTrigger
              value="labs"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Analyses
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ordonnances & Bilans
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

        <div className="bg-card text-card-foreground p-4 rounded-lg min-h-[400px]">
          <Suspense fallback={<TabLoading />}>
            {activeTab === "example" && (
              <TabsContent value="example" className="m-0 border-none p-0 shadow-none">
                <EditPatientForm id={id!} />
              </TabsContent>
            )}
            {activeTab === "vitals" && (
              <TabsContent value="vitals" className="m-0 border-none p-0 shadow-none">
                <VitalSignsChart patientId={id!} />
              </TabsContent>
            )}
            {activeTab === "labs" && (
              <TabsContent value="labs" className="m-0 border-none p-0 shadow-none">
                <LabResultsTab patientId={id!} />
              </TabsContent>
            )}
            {activeTab === "account" && (
              <TabsContent value="account" className="m-0 border-none p-0 shadow-none">
                <ConsultationForm id={id!} />
              </TabsContent>
            )}
            {activeTab === "prescriptions" && (
              <TabsContent value="prescriptions" className="m-0 border-none p-0 shadow-none">
                <MainPrescriptionPage id={id!} mode="prescriptions" />
              </TabsContent>
            )}
            {activeTab === "letters" && (
              <TabsContent value="letters" className="m-0 border-none p-0 shadow-none">
                <MainPrescriptionPage id={id!} mode="letters" />
              </TabsContent>
            )}
            {activeTab === "timeline" && (
              <TabsContent value="timeline" className="m-0 border-none p-0 shadow-none">
                <TimeLine id={id!} />
              </TabsContent>
            )}
            {activeTab === "rendezyous" && (
              <TabsContent value="rendezyous" className="m-0 border-none p-0 shadow-none">
                <AppointmentTab patientId={id!} />
              </TabsContent>
            )}
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}

export default MainPage;

