import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "../Consultation/MainConsultationPage";
import { useParams } from "react-router-dom";
import MainPrescriptionPage from "../Prescription/MainPrescriptionPage";
import { EditPatientForm } from "./EditPatientForm";
function MainPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-4 flex justify-center bg-background">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <TabsList className="w-full flex justify-center bg-muted rounded-lg">
          <TabsTrigger
            value="example"
            className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Patient Details
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
            Prescription
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}

export default MainPage;
