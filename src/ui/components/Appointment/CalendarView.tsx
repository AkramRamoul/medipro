import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useCallback } from "react";
import { GlobalAddAppointmentModal } from "./GlobalAddAppointmentModal";
import { Loader2 } from "lucide-react";
import api from "../../axios";

/* eslint-disable @typescript-eslint/no-explicit-any */

const locales = {
    "fr-FR": fr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const messages = {
    allDay: "Journée",
    previous: "Précédent",
    next: "Suivant",
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    noEventsInRange: "Aucun événement dans cette plage.",
    showMore: (total: number) => `+ ${total} de plus`,
};

export function CalendarView() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [view, setView] = useState<View>(Views.MONTH);

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/appointments");
            const all = response.data;
            const formattedEvents = all.map((apt: any) => ({
                id: apt.id,
                title: `${apt.patientFirstName} ${apt.patientLastName} - ${apt.title} `,
                start: new Date(apt.date),
                end: new Date(new Date(apt.date).getTime() + 30 * 60000), // Assumes 30 min duration
                resource: apt,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const [date, setDate] = useState(new Date());

    const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);

    const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
        setSelectedDate(start);
        setIsAddModalOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event: any) => {
        // Navigate to patient or show details
        if (event.resource?.patientId) {
            window.location.hash = `/pat/${event.resource.patientId}`;
        }
    }, []);

    const eventStyleGetter = (event: any) => {
        const isPast = new Date(event.end) < new Date();
        const backgroundColor = isPast ? "#94a3b8" : "#8b5cf6"; // Slate-400 vs Violet-500 (Primary)

        // Check if theme context is available or just hardcode for now based on primary color
        // Ideally we use CSS variables, but RBG uses inline styles for background.
        // We can use a class instead.

        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                opacity: 0.9,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    return (
        <div className="h-[600px] bg-card rounded-xl border border-border/50 shadow-sm p-4">
            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    messages={messages}
                    culture="fr-FR"
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    views={["month", "week", "day", "agenda"]}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={onNavigate}
                    className="text-sm font-sans"
                />
            )}

            <GlobalAddAppointmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchAppointments();
                }}
                initialDate={selectedDate}
            />
        </div>
    );
}
