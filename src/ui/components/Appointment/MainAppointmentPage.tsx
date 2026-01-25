
import { ClinicAppointmentList } from "./ClinicAppointmentList";

export default function MainAppointmentPage() {
    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
            </div>
            <div className="flex-1 overflow-auto">
                <ClinicAppointmentList />
            </div>
        </div>
    )
}
