import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsultationForm from "./ConsultationForm";

function MainPage() {
  return (
    <div className="p-8 flex justify-center">
      <Tabs defaultValue="account" className="w-full max-w-7xl">
        <TabsList className="w-full flex justify-center">
          <TabsTrigger value="account" className="flex-1">
            Account
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1">
            Password
          </TabsTrigger>
          <TabsTrigger value="example" className="flex-1">
            Example
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="text-center">
          <ConsultationForm />
        </TabsContent>
        <TabsContent value="password" className="text-center">
          Change your password here.
        </TabsContent>
        <TabsContent value="example" className="text-center">
          Example content here.
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
