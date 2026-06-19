import { ClinicAppointmentList } from "./ClinicAppointmentList";
import { CalendarView } from "./CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { GlobalAddAppointmentModal } from "./GlobalAddAppointmentModal";

export default function MainAppointmentPage() {
    const [activeTab, setActiveTab] = useState("list");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="h-full flex flex-col space-y-6 ml-2">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Liste
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendrier
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === "list" && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="gap-2 shadow-md rounded-xl bg-primary hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau Rendez-vous
                        </Button>
                    )}
                </div>

                <TabsContent value="list" className="flex-1 overflow-auto mt-0 border-none p-0 outline-none">
                    <ClinicAppointmentList key={refreshKey} />
                </TabsContent>

                <TabsContent value="calendar" className="flex-1 overflow-auto mt-0 border-none p-0 outline-none">
                    <div className="h-full">
                        <CalendarView />
                    </div>
                </TabsContent>
            </Tabs>

            <GlobalAddAppointmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => setRefreshKey(prev => prev + 1)}
            />
        </div>
    )
}

