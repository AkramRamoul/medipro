import { useState, useEffect, useRef } from "react";
import {
    Loader2,
    CalendarClock,
    Users,
    Timer,
    CheckCircle2,
    Play,
    Eye,
    XCircle,
    Plus,
    RefreshCw,
    PauseCircle,
    UserPlus,
    History,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GlobalAddAppointmentModal } from "../components/Appointment/GlobalAddAppointmentModal";
import NewPatientModal from "../components/NewPatient/NewPatientModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { format, differenceInMinutes } from "date-fns";

interface Appointment {
    id: number;
    time: string;
    title: string;
    status: 'scheduled' | 'checked_in' | 'cancelled';
    patient: {
        id: number;
        first_name: string;
        last_name: string;
    };
    date: string;
    consultation?: {
        id: number;
        status: 'in_progress' | 'completed';
    };
}

interface Consultation {
    id: number;
    patientId: number;
    appointmentId: number | null;
    date: string;
    reason: string;
    status: 'in_progress' | 'completed';
    patient: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function Today() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [standaloneConsultations, setStandaloneConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [secondsAgo, setSecondsAgo] = useState(0);
    const [activeTab, setActiveTab] = useState<"attente" | "consultation" | "termines">("attente");
    const navigate = useNavigate();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchTodayData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [aptRes, consRes] = await Promise.all([
                api.get("/appointments/today"),
                api.get("/consultations/today")
            ]);
            setAppointments(aptRes.data);
            // Case-insensitive/snake_case safety: filter out any consultation that has an appointment ID
            setStandaloneConsultations(consRes.data.filter((c: any) => !c.appointmentId && !c.appointment_id));
            setLastUpdated(new Date());
            setSecondsAgo(0);
        } catch (error) {
            console.error("Failed to fetch today's activity:", error);
            toast.error("Erreur lors de la récupération des données.");
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchTodayData();
    }, []);

    // Auto-refresh polling
    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchTodayData(true);
            }, REFRESH_INTERVAL);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh]);

    // "X seconds ago" ticker
    useEffect(() => {
        const ticker = setInterval(() => {
            setSecondsAgo(s => s + 1);
        }, 1000);
        return () => clearInterval(ticker);
    }, []);

    const handleStartCheckIn = async (appointment: Appointment) => {
        try {
            await api.post('/consultations/start', {
                patientId: appointment.patient.id,
                appointmentId: appointment.id,
                reason: appointment.title
            });
            toast.success("Consultation démarrée.");
            setActiveTab("consultation");
            fetchTodayData();
        } catch (error) {
            console.error("Failed to start consultation:", error);
            toast.error("Erreur lors du démarrage de la consultation.");
        }
    };

    const handleCancelAppointment = async (id: number) => {
        try {
            await api.put(`/appointments/${id}`, { status: 'cancelled' });
            toast.info("Rendez-vous annulé.");
            fetchTodayData();
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
        }
    };

    const handleCompleteConsultation = async (appointment: Appointment) => {
        try {
            if (appointment.consultation) {
                // If consultation exists, just complete it
                await api.put(`/consultations/${appointment.consultation.id}`, { status: 'completed' });
            } else {
                // If no consultation exists (silent check-in), create a completed one
                await api.post('/consultations', {
                    patientId: appointment.patient.id,
                    appointmentId: appointment.id,
                    reason: appointment.title,
                    status: 'completed',
                    diagnosis: '',
                    date: new Date().toISOString()
                });
            }
            toast.success("Consultation terminée.");
            fetchTodayData();
        } catch (error) {
            console.error("Failed to complete consultation:", error);
            toast.error("Erreur lors de la clôture.");
        }
    };

    const enAttente = appointments.filter(a => a.status === 'scheduled');
    const enConsultation = appointments.filter(a => a.status === 'checked_in' && a.consultation?.status === 'in_progress');
    const termines = [
        ...appointments.filter(a => a.consultation?.status === 'completed'),
        ...standaloneConsultations.filter(c => c.status === 'completed')
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const annulations = appointments.filter(a => a.status === 'cancelled');

    const journal = [
        ...appointments,
        ...standaloneConsultations
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const stats = {
        waiting: enAttente.length,
        inConsultation: enConsultation.length,
        completed: termines.length,
        cancelled: annulations.length,
        // The total is the sum of all active categories to prevent double counting
        total: enAttente.length + enConsultation.length + termines.length + annulations.length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-4 md:p-8 flex text-foreground transition-colors overflow-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between flex-wrap gap-6 border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <CalendarClock className="h-7 w-7" />
                        </div>
                        Aujourd'hui
                    </h2>
                    <p className="text-muted-foreground text-lg ml-12">
                        Gérez votre flux opérationnel quotidien.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Live indicator */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-background border shadow-sm">
                        {autoRefresh ? (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                        ) : (
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                        {lastUpdated && (
                            <span className="font-medium">
                                {secondsAgo < 5
                                    ? "À l'instant"
                                    : `${secondsAgo}s`}
                            </span>
                        )}
                        <div className="h-4 w-px bg-border mx-1" />
                        <button
                            type="button"
                            onClick={() => fetchTodayData(true)}
                            className="p-1 rounded hover:text-foreground transition-colors"
                            title="Actualiser maintenant"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setAutoRefresh(r => !r)}
                            className={`p-1 rounded transition-colors ${autoRefresh
                                ? "hover:text-foreground"
                                : "text-amber-500"
                                }`}
                            title={autoRefresh ? "Mettre en pause" : "Reprendre l'actualisation"}
                        >
                            <PauseCircle className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <Button variant="outline" onClick={() => setIsNewPatientOpen(true)} className="gap-2 shadow-sm rounded-xl border-border/60">
                        <UserPlus className="h-4 w-4" />
                        Nouveau Patient
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-md rounded-xl bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        Nouveau Rendez-vous
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Rendez-vous</CardTitle>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:scale-110 transition-transform">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-950 dark:text-blue-100">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="group bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">En Attente</CardTitle>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg group-hover:scale-110 transition-transform">
                            <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-950 dark:text-amber-100">{stats.waiting}</div>
                    </CardContent>
                </Card>
                <Card className="group bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">En Consultation</CardTitle>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:scale-110 transition-transform">
                            <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-950 dark:text-indigo-100">{stats.inConsultation}</div>
                    </CardContent>
                </Card>
                <Card className="group bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Terminés</CardTitle>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-950 dark:text-emerald-100">{stats.completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
                <div className="overflow-x-auto pb-2 flex justify-center">
                    <TabsList className="h-14 p-1 inline-flex items-center justify-center bg-muted/40 rounded-xl border shadow-inner">
                        <TabsTrigger value="attente" className="h-11 px-6 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-amber-600 transition-all text-base font-medium">
                            <Timer className="h-4 w-4" />
                            En attente <span className="ml-1 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs">{enAttente.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="consultation" className="h-11 px-6 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all text-base font-medium">
                            <Play className="h-4 w-4" />
                            Consultation <span className="ml-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">{enConsultation.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="termines" className="h-11 px-6 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all text-base font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Terminés <span className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs">{termines.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="annulations" className="h-11 px-6 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-destructive transition-all text-base font-medium">
                            <XCircle className="h-4 w-4" />
                            Annulés <span className="ml-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs">{annulations.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="journal" className="h-11 px-6 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all text-base font-medium">
                            <History className="h-4 w-4" />
                            Journal
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="attente" className="mt-4">
                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                        {enAttente.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Timer className="h-16 w-16 text-muted-foreground/30" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-foreground/80">Personne en attente</h3>
                                    <p className="text-muted-foreground mt-1">Tous les patients programmés ont été vus ou ne sont pas encore arrivés.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-semibold">Heure</TableHead>
                                        <TableHead className="font-semibold">Patient</TableHead>
                                        <TableHead className="font-semibold">Motif</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                        {enAttente.map((apt) => {
                                            let delayMinutes = 0;
                                            const hasTime = apt.time && apt.time !== "" && apt.time !== "00:00";
                                            const hasDateWithTime = apt.date && apt.date.includes('T') && !apt.date.endsWith('T') && !apt.date.includes('T00:00');

                                            if (hasTime || hasDateWithTime) {
                                                try {
                                                    const aptDateTimeStr = hasDateWithTime
                                                        ? apt.date
                                                        : `${format(new Date(), 'yyyy-MM-dd')}T${apt.time}:00`;
                                                    const aptDateObj = new Date(aptDateTimeStr);
                                                    delayMinutes = differenceInMinutes(new Date(), aptDateObj);
                                                } catch (e) {
                                                    // ignore parse errors
                                                }
                                            }
                                        const isDelayed = delayMinutes > 15;

                                        return (
                                            <TableRow key={apt.id} className="hover:bg-muted/50 transition-colors group">
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <span className={isDelayed ? "text-amber-600 dark:text-amber-500" : "text-foreground"}>
                                                            {apt.time && apt.time !== "00:00" ? apt.time : (apt.date && apt.date.includes('T') && !apt.date.includes('T00:00') ? apt.date.split('T')[1].substring(0, 5) : "--:--")}
                                                        </span>
                                                        {isDelayed && (
                                                            <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px] px-1.5 h-5 flex gap-1 items-center">
                                                                <AlertCircle className="w-3 h-3" />
                                                                +{delayMinutes}m
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-base">
                                                    {apt.patient.first_name} {apt.patient.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-normal text-muted-foreground bg-slate-100 dark:bg-slate-800">
                                                        {apt.title || "Consultation"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <Button size="sm" onClick={() => handleStartCheckIn(apt)} className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-lg">
                                                            <Play className="h-3.5 w-3.5 fill-current" /> Démarrer
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleCancelAppointment(apt.id)} title="Annuler">
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="consultation" className="mt-4">
                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                        {enConsultation.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Play className="h-16 w-16 text-muted-foreground/30" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-foreground/80">Aucune consultation en cours</h3>
                                    <p className="text-muted-foreground mt-1">Démarrez une consultation depuis l'onglet "En attente".</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-semibold">Heure</TableHead>
                                        <TableHead className="font-semibold">Patient</TableHead>
                                        <TableHead className="font-semibold">Motif</TableHead>
                                        <TableHead className="font-semibold">Statut Med.</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enConsultation.map((apt) => (
                                        <TableRow key={apt.id} className="hover:bg-muted/50 transition-colors group">
                                            <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                {apt.time && apt.time !== "00:00" ? apt.time : (apt.date && apt.date.includes('T') && !apt.date.includes('T00:00') ? apt.date.split('T')[1].substring(0, 5) : "--:--")}
                                            </TableCell>
                                            <TableCell className="font-medium text-base">
                                                {apt.patient.first_name} {apt.patient.last_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{apt.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="animate-pulse bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                                                    En cours
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate(`/pat/${apt.patient.id}`)}
                                                        className="gap-1.5 shadow-sm rounded-lg hover:bg-muted"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> Voir
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleCompleteConsultation(apt)}
                                                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-lg"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Terminer
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="termines" className="mt-4">
                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                        {termines.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <CheckCircle2 className="h-16 w-16 text-muted-foreground/30" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-foreground/80">Aucun patient terminé</h3>
                                    <p className="text-muted-foreground mt-1">Les consultations terminées aujourd'hui s'afficheront ici.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-semibold">Heure</TableHead>
                                        <TableHead className="font-semibold">Patient</TableHead>
                                        <TableHead className="font-semibold">Motif</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {termines.map((item) => {
                                        const isAppointment = 'time' in item;
                                        const time = isAppointment
                                            ? (item.time && item.time !== "00:00" ? item.time : (item.date && item.date.includes('T') && !item.date.includes('T00:00') ? item.date.split('T')[1].substring(0, 5) : "--:--"))
                                            : format(new Date(item.date), "HH:mm");
                                        const patient = item.patient;
                                        const title = isAppointment ? item.title : item.reason;

                                        return (
                                            <TableRow key={`${isAppointment ? 'a' : 'c'}-${item.id}`} className="hover:bg-muted/50 transition-colors group">
                                                <TableCell className="font-semibold text-muted-foreground">
                                                    {time}
                                                </TableCell>
                                                <TableCell className="font-medium text-base">
                                                    {patient.first_name} {patient.last_name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground italic">{title || "Sans motif"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-normal bg-slate-100 dark:bg-slate-800">
                                                        {isAppointment ? "Rendez-vous" : "Directe"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigate(`/pat/${patient.id}`)}
                                                        className="gap-1.5 hover:bg-primary/10 hover:text-primary rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> Dossier
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="annulations" className="mt-4">
                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                        {annulations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <XCircle className="h-16 w-16 text-muted-foreground/30" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-foreground/80">Aucune annulation</h3>
                                    <p className="text-muted-foreground mt-1">Les rendez-vous annulés aujourd'hui s'afficheront ici.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-semibold">Heure</TableHead>
                                        <TableHead className="font-semibold">Patient</TableHead>
                                        <TableHead className="font-semibold">Motif</TableHead>
                                        <TableHead className="text-right font-semibold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {annulations.map((apt) => (
                                        <TableRow key={apt.id} className="hover:bg-muted/50 transition-colors opacity-70">
                                            <TableCell className="font-semibold text-muted-foreground line-through">
                                                {apt.time && apt.time !== "00:00" ? apt.time : (apt.date && apt.date.includes('T') && !apt.date.includes('T00:00') ? apt.date.split('T')[1].substring(0, 5) : "--:--")}
                                            </TableCell>
                                            <TableCell className="font-medium text-base">
                                                {apt.patient.first_name} {apt.patient.last_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground italic">{apt.title}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-transparent font-normal">
                                                    Annulé
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="journal" className="mt-4">
                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                        {journal.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <History className="h-16 w-16 text-muted-foreground/30" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-foreground/80">Journal vide</h3>
                                    <p className="text-muted-foreground mt-1">L'activité de la journée s'affichera ici chronologiquement.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-semibold">Heure/Date</TableHead>
                                        <TableHead className="font-semibold">Patient</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Statut</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {journal.map((item) => {
                                        const isAppointment = 'time' in item;
                                        const time = isAppointment
                                            ? (item.time && item.time !== "00:00" ? item.time : (item.date && item.date.includes('T') && !item.date.includes('T00:00') ? item.date.split('T')[1].substring(0, 5) : "--:--"))
                                            : format(new Date(item.date), "HH:mm");
                                        const status = isAppointment ? item.status : item.status; // simplified

                                        return (
                                            <TableRow key={`${isAppointment ? 'aj' : 'cj'}-${item.id}`} className="hover:bg-muted/50 transition-colors group">
                                                <TableCell className="text-muted-foreground font-mono">
                                                    {time}
                                                </TableCell>
                                                <TableCell className="font-medium text-base">
                                                    {item.patient.first_name} {item.patient.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={isAppointment ? "bg-background text-foreground" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}>
                                                        {isAppointment ? "RDV" : "Directe"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        status === 'completed' ? 'default' :
                                                            status === 'in_progress' ? 'secondary' :
                                                                status === 'cancelled' ? 'destructive' : 'outline'
                                                    } className={`${status === 'in_progress' ? 'animate-pulse bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' : ''} ${status === 'scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 font-normal' : ''} ${status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 font-normal' : ''}`}>
                                                        {status === 'scheduled' ? 'Attente' :
                                                            status === 'checked_in' || status === 'in_progress' ? 'En cours' :
                                                                status === 'completed' ? 'Terminé' : 'Annulé'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/pat/${item.patient.id}`)} className="opacity-80 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-lg">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <GlobalAddAppointmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTodayData}
            />
            <NewPatientModal
                isOpen={isNewPatientOpen}
                onClose={() => setIsNewPatientOpen(false)}
            />
        </div>
    );
}

export default Today;
