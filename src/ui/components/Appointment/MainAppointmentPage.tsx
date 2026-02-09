import { ClinicAppointmentList } from "./ClinicAppointmentList";
import { CalendarView } from "./CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, List } from "lucide-react";

export default function MainAppointmentPage() {
    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
            </div>

            <Tabs defaultValue="list" className="flex-1 flex flex-col">
                <div className="flex justify-start mb-4">
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
                </div>

                <TabsContent value="list" className="flex-1 overflow-auto mt-0 border-none p-0 outline-none">
                    <ClinicAppointmentList />
                </TabsContent>

                <TabsContent value="calendar" className="flex-1 overflow-auto mt-0 border-none p-0 outline-none">
                    <div className="h-full">
                        <CalendarView />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
