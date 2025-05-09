import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import GeneralSettings from "./GeneralSettings/GeneralSettings";
import { PasswordForm } from "./PassordSettings.tsx/PasswordForm";
import { PrescriptionModelForm } from "./PrescriptionModelForm";

function Settings() {
  return (
    <div className="p-4 flex justify-center bg-background">
      <Tabs defaultValue="example" className="w-full max-w-5xl">
        {/* Tab Headers */}
        <TabsList className="w-full flex justify-center bg-muted rounded-lg overflow-hidden">
          <TabsTrigger
            value="example"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Paramètres généraux
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Paramètres d'Ordonnance
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Mot de passe
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent
          value="example"
          className="text-center text-foreground mt-6"
        >
          <GeneralSettings />
        </TabsContent>
        <TabsContent
          value="account"
          className="text-center text-foreground mt-6"
        >
          <PrescriptionModelForm />
        </TabsContent>
        <TabsContent
          value="password"
          className="text-center text-foreground mt-6"
        >
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;
