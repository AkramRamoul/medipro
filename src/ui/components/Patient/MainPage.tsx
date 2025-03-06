import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "./ConsultationForm";
import { useParams } from "react-router-dom";
import MedicationInput from "./MedicationInput";
function MainPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-4 flex justify-center">
      <Tabs defaultValue="account" className="w-full max-w-7xl">
        <TabsList className="w-full flex justify-center">
          <TabsTrigger value="account" className="flex-1">
            Consultation
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1">
            Password
          </TabsTrigger>
          <TabsTrigger value="example" className="flex-1">
            Example
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="text-center">
          <ConsultationForm id={id!} />
        </TabsContent>
        <TabsContent value="password" className="text-center">
          <MedicationInput />
        </TabsContent>
        <TabsContent value="example" className="text-center">
          Example content here.
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
