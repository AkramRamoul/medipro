import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import GeneralSettings from "./GeneralSettings/GeneralSettings";
import { PasswordForm } from "./PassordSettings.tsx/PasswordForm";
import { PrescriptionModelForm } from "./PrescriptionModelForm";

function Settings() {
  return (
    <div className="p-4 flex justify-center">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        <TabsList className="w-full flex justify-center">
          <TabsTrigger value="example" className="flex-1">
            General Settings
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1">
            Paramaetres d'Ordonnance
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1">
            Password
          </TabsTrigger>
        </TabsList>
        <TabsContent value="example" className="text-center">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="account" className="text-center">
          <PrescriptionModelForm />
        </TabsContent>
        <TabsContent value="password" className="text-center">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;
