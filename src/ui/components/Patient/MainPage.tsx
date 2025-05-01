import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "../Consultation/MainConsultationPage";
import { useParams } from "react-router-dom";
import MainPrescriptionPage from "../Prescription/MainPrescriptionPage";
import { EditPatientForm } from "./EditPatientForm";
function MainPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-4 flex justify-center bg-white dark:bg-gray-800">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <TabsList className="w-full flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
          <TabsTrigger
            value="example"
            className="flex-1 dark:text-white data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Patient Details
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex-1 dark:text-white data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Consultation
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="flex-1 dark:text-white data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Prescription
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="example"
          className="text-center bg-white dark:bg-gray-900 p-4 rounded-lg"
        >
          <EditPatientForm id={id!} />
        </TabsContent>
        <TabsContent
          value="account"
          className="text-center bg-white dark:bg-gray-900 p-4 rounded-lg"
        >
          <ConsultationForm id={id!} />
        </TabsContent>
        <TabsContent
          value="password"
          className="text-center bg-white dark:bg-gray-900 p-4 rounded-lg"
        >
          <MainPrescriptionPage id={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
