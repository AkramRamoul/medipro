import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "../Consultation/MainConsultationPage";
import { useParams } from "react-router-dom";
import MainPrescriptionPage from "../Prescription/MainPrescriptionPage";
import { EditPatientForm } from "./EditPatientForm";
function MainPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-4 flex justify-center">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <TabsList className="w-full flex justify-center">
          <TabsTrigger value="example" className="flex-1">
            Patient Details
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1">
            Consultation
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1">
            Precritption
          </TabsTrigger>
        </TabsList>
        <TabsContent value="example" className="text-center">
          <EditPatientForm id={id!} />
        </TabsContent>
        <TabsContent value="account" className="text-center">
          <ConsultationForm id={id!} />
        </TabsContent>
        <TabsContent value="password" className="text-center">
          <MainPrescriptionPage id={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
