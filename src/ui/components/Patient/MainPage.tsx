import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "../Consultation/MainConsultationPage";
import { useParams } from "react-router-dom";
import MainPrescriptionPage from "../Prescription/MainPrescriptionPage";
import { EditPatientForm } from "./EditPatientForm";
import TimeLine from "../Timeline/TimeLine";
function MainPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-4 flex justify-center">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <TabsList className="w-full flex justify-center bg-muted rounded-lg">
          <TabsTrigger
            value="example"
            className="flex-1 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Détails du patient{" "}
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
        <TabsContent
          value="timeline"
          className="bg-card text-card-foreground p-4 rounded-lg"
        >
          <TimeLine id={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
