
import { useState } from "react";
import { Button } from "../ui/button";
import { Plus, CalendarDays } from "lucide-react";
import { AppointmentList } from "./AppointmentList";
import { AddAppointmentModal } from "./AddAppointmentModal";

export function AppointmentTab({ patientId }: { patientId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            Gestion des Rendez-vous
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Planifiez et suivez les consultations à venir
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Rendez-vous
                </Button>
            </div>

            <AppointmentList patientId={patientId} refreshTrigger={refreshTrigger} />

            <AddAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                patientId={patientId}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    );
}
