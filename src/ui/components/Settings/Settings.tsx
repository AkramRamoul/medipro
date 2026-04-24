import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Users,
  Database,
  FileText,
  ClipboardList,
  FlaskConical,
  Activity,
  Layout,
  ShieldCheck,
  Pill
} from "lucide-react";
import DatabaseSettings from "./DataBaseSettings";
import PrescriptionTemplatesSettings from "./PrescriptionTemplatesSettings";
import DocumentTemplatesSettings from "./DocumentTemplatesSettings";
import BilanListSettings from "./BilanListSettings";
import BilanTemplatesSettings from "./BilanTemplatesSettings";
import DiagnosticListSettings from "./ConsultationListSettings";
import ExamFormsSettings from "./ExamFormsSettings";
import UserManagement from "./UserManagement";
import MedicationListSettings from "./MedicationListSettings";
import { useAuth } from "../../context/auth-context";

function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isMedical = user?.role === "doctor" || user?.role === "admin";
  const defaultTab = isAdmin ? "users" : "backup";


  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <Tabs defaultValue={defaultTab} className="flex w-full min-h-[calc(100vh-80px)]">
        {/* Seamless Navigation Sidebar */}
        <aside className="w-72 flex-shrink-0 border-r bg-muted/20">
          <div className="sticky top-0 p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest px-1">Administration</p>
            </div>

            <div className="space-y-8">
              <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-0">
                {isAdmin && (
                  <TabsTrigger value="users" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Utilisateurs</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="backup" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">Base de données</span>
                </TabsTrigger>
              </TabsList>

              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest px-4">Configuration Médicale</p>
                <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-0">
                  <TabsTrigger value="exam-forms" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <Layout className="w-4 h-4" />
                    <span className="text-sm font-medium">Examens</span>
                  </TabsTrigger>
                  <TabsTrigger value="diagnostics" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Lexique Diagnostics</span>
                  </TabsTrigger>
                  <TabsTrigger value="prescription-templates" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Ordonnances Types</span>
                  </TabsTrigger>
                  <TabsTrigger value="document-templates" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Modèles de Documents</span>
                  </TabsTrigger>
                  <TabsTrigger value="bilans" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <FlaskConical className="w-4 h-4" />
                    <span className="text-sm font-medium">Catalogue Analyses</span>
                  </TabsTrigger>
                  <TabsTrigger value="medications" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <Pill className="w-4 h-4" />
                    <span className="text-sm font-medium">Catalogue Médicaments</span>
                  </TabsTrigger>
                  <TabsTrigger value="bilan-templates" className="flex items-center gap-3 px-4 py-3 w-full justify-start text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all rounded-xl border border-transparent hover:bg-muted/50 group">
                    <ClipboardList className="w-4 h-4" />
                    <span className="text-sm font-medium">Modèles de Bilans</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Seamless Content Area */}
        <main className="flex-1 min-w-0 bg-background overflow-y-auto">
          <div className="max-w-7xl px-8 py-10 md:px-12">
            {isAdmin && (
              <TabsContent value="users" className="mt-0 border-none outline-none focus-visible:ring-0">
                <UserManagement />
              </TabsContent>
            )}
            
            <TabsContent value="backup" className="mt-0 border-none outline-none focus-visible:ring-0">
              <DatabaseSettings />
            </TabsContent>

            {isMedical && (
              <>
                <TabsContent value="exam-forms" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <ExamFormsSettings />
                </TabsContent>
                <TabsContent value="diagnostics" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <DiagnosticListSettings />
                </TabsContent>
                <TabsContent value="prescription-templates" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <PrescriptionTemplatesSettings />
                </TabsContent>
                <TabsContent value="document-templates" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <DocumentTemplatesSettings />
                </TabsContent>
                <TabsContent value="bilans" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <BilanListSettings />
                </TabsContent>
                <TabsContent value="medications" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <MedicationListSettings />
                </TabsContent>
                <TabsContent value="bilan-templates" className="mt-0 border-none outline-none focus-visible:ring-0">
                  <BilanTemplatesSettings />
                </TabsContent>
              </>
            )}
          </div>
        </main>
      </Tabs>
    </div>
  );
}

export default Settings;
