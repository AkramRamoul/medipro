import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import DatabaseSettings from "./DataBaseSettings";
import { PasswordForm } from "./PassordSettings.tsx/PasswordForm";
import ConsultationFieldsSettings from "./ConsultationFieldsSettings";
import PrescriptionTemplatesSettings from "./PrescriptionTemplatesSettings";
import DocumentTemplatesSettings from "./DocumentTemplatesSettings";
import BilanListSettings from "./BilanListSettings";

function Settings() {
  return (
    <div className="p-4 flex justify-center bg-background">
      <Tabs defaultValue="password" className="w-full max-w-5xl">
        {/* Tab Headers */}
        <TabsList className="w-full flex justify-center bg-muted rounded-lg overflow-hidden">
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
            Ordonnances types
          </TabsTrigger>
          <TabsTrigger
            value="document-templates"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Modèles de documents
          </TabsTrigger>
          <TabsTrigger
            value="bilans"
            className="flex-1 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Bilans
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
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
        <TabsContent
          value="document-templates"
          className="text-center text-foreground mt-6"
        >
          <DocumentTemplatesSettings />
        </TabsContent>
        <TabsContent
          value="bilans"
          className="text-center text-foreground mt-6"
        >
          <BilanListSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;
