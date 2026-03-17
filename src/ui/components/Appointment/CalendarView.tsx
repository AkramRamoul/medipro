import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isThisMonth, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { GlobalAddAppointmentModal } from "./GlobalAddAppointmentModal";
import {
    Loader2,
    CalendarPlus,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock,
    FileText,
    X,
    CheckCircle2,
    XCircle,
    ExternalLink,
    LayoutGrid,
    List,
    AlignJustify,
} from "lucide-react";
import { Button } from "../ui/button";
import api from "../../axios";
import { useNavigate } from "react-router-dom";

/* eslint-disable @typescript-eslint/no-explicit-any */

const locales = { "fr-FR": fr };

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

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; badge: string }> = {
    scheduled: {
        label: "Planifié",
        bg: "#8b5cf6",
        border: "#7c3aed",
        badge: "bg-violet-100 text-violet-700 border-violet-200",
    },
    completed: {
        label: "Terminé",
        bg: "#10b981",
        border: "#059669",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    cancelled: {
        label: "Annulé",
        bg: "#ef4444",
        border: "#dc2626",
        badge: "bg-red-100 text-red-700 border-red-200",
    },
};

// ─── Custom Toolbar ──────────────────────────────────────────────────────────

function CustomToolbar({ label, onNavigate, onView, view }: any) {
    const viewOptions = [
        { key: "month", label: "Mois", Icon: LayoutGrid },
        { key: "week", label: "Semaine", Icon: List },
        { key: "day", label: "Jour", Icon: AlignJustify },
        { key: "agenda", label: "Agenda", Icon: AlignJustify },
    ];

    return (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            {/* Navigation */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onNavigate("PREV")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => onNavigate("TODAY")}
                >
                    Aujourd'hui
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onNavigate("NEXT")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-foreground ml-1 capitalize">
                    {label}
                </span>
            </div>

            {/* View switcher */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {viewOptions.map(({ key, label: lbl }) => (
                    <button
                        key={key}
                        onClick={() => onView(key)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === key
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {lbl}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Event Detail Popover ─────────────────────────────────────────────────────

interface EventDetailPopoverProps {
    event: any;
    position: { x: number; y: number };
    onClose: () => void;
    onStatusChange: (id: number, status: string) => void;
    onNavigatePatient: (id: number) => void;
}

function EventDetailPopover({
    event,
    position,
    onClose,
    onStatusChange,
    onNavigatePatient,
}: EventDetailPopoverProps) {
    const ref = useRef<HTMLDivElement>(null);
    const apt = event.resource;
    const status = apt.status || "scheduled";
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;

    // Adjust position to stay in viewport
    const [pos, setPos] = useState(position);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let { x, y } = position;
            if (x + rect.width + 20 > vw) x = vw - rect.width - 20;
            if (y + rect.height + 20 > vh) y = vh - rect.height - 20;
            if (x < 10) x = 10;
            if (y < 10) y = 10;
            setPos({ x, y });
        }
    }, [position]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const hasTime = event.start.getHours() !== 0 || event.start.getMinutes() !== 0;

    return (
        <div
            ref={ref}
            className="fixed z-[9999] w-72 bg-popover border border-border rounded-xl shadow-xl p-0 overflow-hidden"
            style={{ left: pos.x, top: pos.y }}
        >
            {/* Header stripe */}
            <div
                className="px-4 py-3 flex items-start justify-between"
                style={{ background: cfg.bg + "22", borderBottom: `2px solid ${cfg.bg}` }}
            >
                <div className="flex-1 min-w-0">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-1 ${cfg.badge}`}
                    >
                        {cfg.label}
                    </span>
                    <p className="font-semibold text-sm text-foreground leading-tight truncate">
                        {apt.patientFirstName} {apt.patientLastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{apt.title}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-2 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-foreground">
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="capitalize">
                        {format(event.start, "EEEE d MMMM yyyy", { locale: fr })}
                    </span>
                </div>
                {hasTime && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{format(event.start, "HH:mm")}</span>
                    </div>
                )}
                {apt.notes && (
                    <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground line-clamp-3">{apt.notes}</span>
                    </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                <Button
                    size="sm"
                    className="w-full gap-2 justify-center"
                    onClick={() => {
                        onNavigatePatient(apt.patientId);
                        onClose();
                    }}
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Voir le patient
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    {status !== "completed" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={() => {
                                onStatusChange(apt.id, "completed");
                                onClose();
                            }}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Terminé
                        </Button>
                    )}
                    {status !== "cancelled" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                                onStatusChange(apt.id, "cancelled");
                                onClose();
                            }}
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Annuler
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Calendar View ───────────────────────────────────────────────────────

export function CalendarView() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/appointments");
            const all = response.data;
            const formattedEvents = all.map((apt: any) => ({
                id: apt.id,
                title: `${apt.patientFirstName} ${apt.patientLastName} — ${apt.title}`,
                start: new Date(apt.date),
                end: new Date(new Date(apt.date).getTime() + 30 * 60000),
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

    const onNavigate = useCallback((newDate: Date) => setDate(newDate), []);

    const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
        setSelectedDate(start);
        setIsAddModalOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event: any, e: React.SyntheticEvent) => {
        const nativeEvent = e.nativeEvent as MouseEvent;
        setPopoverPos({ x: nativeEvent.clientX + 12, y: nativeEvent.clientY + 12 });
        setSelectedEvent(event);
    }, []);

    const handleStatusChange = useCallback(async (id: number, status: string) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            fetchAppointments();
        } catch (err) {
            console.error("Failed to update appointment status", err);
        }
    }, [fetchAppointments]);

    const eventStyleGetter = (event: any) => {
        const apt = event.resource;
        const status = apt?.status || "scheduled";
        const isPast = new Date(event.end) < new Date();

        let bg = STATUS_CONFIG[status]?.bg || "#8b5cf6";
        if (status === "scheduled" && isPast) bg = "#94a3b8";

        return {
            style: {
                backgroundColor: bg,
                borderRadius: "5px",
                opacity: status === "cancelled" ? 0.6 : 0.92,
                color: "white",
                border: "0px",
                display: "block",
                fontSize: "12px",
                fontWeight: "500",
            },
        };
    };

    // ── Stats ──
    const todayCount = events.filter((e) => isToday(e.start)).length;
    const monthCount = events.filter((e) => isThisMonth(e.start)).length;

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Stats bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg px-3 py-1.5">
                        <CalendarDays className="h-4 w-4 text-violet-500" />
                        <div>
                            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Aujourd'hui</p>
                            <p className="text-sm font-bold text-violet-700 dark:text-violet-400 leading-none">
                                {todayCount} RDV
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-1.5">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Ce mois</p>
                            <p className="text-sm font-bold text-foreground leading-none">
                                {monthCount} RDV
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => {
                        setSelectedDate(new Date());
                        setIsAddModalOpen(true);
                    }}
                    className="gap-2 shadow-sm"
                    size="sm"
                >
                    <CalendarPlus className="h-4 w-4" />
                    Nouveau RDV
                </Button>
            </div>

            {/* Calendar */}
            <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm p-4 min-h-[580px]">
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
                        components={{
                            toolbar: CustomToolbar,
                        }}
                    />
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-2 flex-wrap px-1">
                <span className="text-xs text-muted-foreground font-medium">Légende :</span>
                {Object.entries(STATUS_CONFIG).map(([, cfg]) => (
                    <div key={cfg.label} className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: cfg.bg }}
                        />
                        <span className="text-xs text-muted-foreground">{cfg.label}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
                    <span className="text-xs text-muted-foreground">Passé</span>
                </div>
            </div>

            {/* Event detail popover */}
            {selectedEvent && (
                <EventDetailPopover
                    event={selectedEvent}
                    position={popoverPos}
                    onClose={() => setSelectedEvent(null)}
                    onStatusChange={handleStatusChange}
                    onNavigatePatient={(id) => navigate(`/pat/${id}`)}
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
