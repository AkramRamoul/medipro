
import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { AppointmentList } from "./AppointmentList";
import { AddAppointmentModal } from "./AddAppointmentModal";

export function AppointmentTab({ patientId }: { patientId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un rendez-vous
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
