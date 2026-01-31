import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import DatabaseSettings from "./DataBaseSettings";
import GeneralSettings from "./GeneralSettings/GeneralSettings";
import { PasswordForm } from "./PassordSettings.tsx/PasswordForm";
import ConsultationFieldsSettings from "./ConsultationFieldsSettings";
import PrescriptionTemplatesSettings from "./PrescriptionTemplatesSettings";

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
            value="password"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Mot de passe
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Base de données
          </TabsTrigger>
          <TabsTrigger
            value="consultation-fields"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Champs de consultation
          </TabsTrigger>
          <TabsTrigger
            value="prescription-templates"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Modèles d'ordonnance
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
          value="password"
          className="text-center text-foreground mt-6"
        >
          <PasswordForm />
        </TabsContent>
        <TabsContent
          value="backup"
          className="text-center text-foreground mt-6"
        >
          <DatabaseSettings />
        </TabsContent>
        <TabsContent
          value="consultation-fields"
          className="text-center text-foreground mt-6"
        >
          <ConsultationFieldsSettings />
        </TabsContent>
        <TabsContent
          value="prescription-templates"
          className="text-center text-foreground mt-6"
        >
          <PrescriptionTemplatesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;
