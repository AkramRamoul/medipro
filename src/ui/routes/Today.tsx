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
import { format } from "date-fns";

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
            setStandaloneConsultations(consRes.data.filter((c: Consultation) => !c.appointmentId));
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
        total: appointments.length + standaloneConsultations.length,
        waiting: enAttente.length,
        inConsultation: enConsultation.length,
        completed: termines.length,
        cancelled: annulations.length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="h-full flex-1 flex-col space-y-6 p-4 md:p-8 flex bg-background text-foreground transition-colors overflow-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarClock className="h-8 w-8 text-primary" />
                        Aujourd'hui
                    </h2>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Gérez votre flux opérationnel quotidien.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live indicator */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {autoRefresh && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                        )}
                        {lastUpdated && (
                            <span>
                                {secondsAgo < 5
                                    ? "À l'instant"
                                    : `Il y a ${secondsAgo}s`}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => fetchTodayData(true)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            title="Actualiser maintenant"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setAutoRefresh(r => !r)}
                            className={`p-1 rounded transition-colors ${autoRefresh
                                ? "hover:bg-muted text-muted-foreground"
                                : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                }`}
                            title={autoRefresh ? "Mettre en pause" : "Reprendre l'actualisation"}
                        >
                            <PauseCircle className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <Button variant="outline" onClick={() => setIsNewPatientOpen(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Nouveau Patient
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nouveau Rendez-vous
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rendez-vous</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                        <Timer className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.waiting}</div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Consultation</CardTitle>
                        <Play className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inConsultation}</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terminés</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="h-14 p-1 inline-flex items-center justify-start bg-muted/40 rounded-xl">
                        <TabsTrigger value="attente" className="h-11 px-8 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-base">
                            <Timer className="h-4 w-4" />
                            En attente ({enAttente.length})
                        </TabsTrigger>
                        <TabsTrigger value="consultation" className="h-11 px-8 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-base">
                            <Play className="h-4 w-4" />
                            En consultation ({enConsultation.length})
                        </TabsTrigger>
                        <TabsTrigger value="termines" className="h-11 px-8 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-base">
                            <CheckCircle2 className="h-4 w-4" />
                            Terminés ({termines.length})
                        </TabsTrigger>
                        <TabsTrigger value="annulations" className="h-11 px-8 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-base text-destructive data-[state=active]:text-destructive">
                            <XCircle className="h-4 w-4" />
                            Annulés ({annulations.length})
                        </TabsTrigger>
                        <TabsTrigger value="journal" className="h-11 px-8 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-base">
                            <History className="h-4 w-4" />
                            Journal
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="attente">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {enAttente.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Timer className="h-16 w-16 text-muted-foreground opacity-20" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">Personne en attente</h3>
                                    <p className="text-muted-foreground">Tous les patients programmés ont été vus ou ne sont pas encore arrivés.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Heure</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Motif</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enAttente.map((apt) => (
                                        <TableRow key={apt.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-semibold text-primary">
                                                {apt.time || (apt.date && apt.date.includes('T') ? apt.date.split('T')[1].substring(0, 5) : "--:--")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {apt.patient.first_name} {apt.patient.last_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{apt.title}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => handleStartCheckIn(apt)} variant="default" className="gap-1">
                                                        <Play className="h-3 w-3" /> Démarrer
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleCancelAppointment(apt.id)}>
                                                        <XCircle className="h-3 w-3" />
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

                <TabsContent value="consultation">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {enConsultation.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Play className="h-16 w-16 text-muted-foreground opacity-20" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">Aucune consultation en cours</h3>
                                    <p className="text-muted-foreground">Démarrez une consultation depuis l'onglet "En attente".</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Heure</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Motif</TableHead>
                                        <TableHead>Statut Med.</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enConsultation.map((apt) => (
                                        <TableRow key={apt.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-semibold text-primary">
                                                {apt.time || (apt.date && apt.date.includes('T') ? apt.date.split('T')[1].substring(0, 5) : "--:--")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {apt.patient.first_name} {apt.patient.last_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{apt.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="animate-pulse border-blue-500 text-blue-500">
                                                    En cours
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate(`/pat/${apt.patient.id}`)}
                                                        className="gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" /> Voir
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleCompleteConsultation(apt)}
                                                        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" /> Terminer
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

                <TabsContent value="termines">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {termines.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <CheckCircle2 className="h-16 w-16 text-muted-foreground opacity-20" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">Aucun patient terminé</h3>
                                    <p className="text-muted-foreground">Les consultations terminées aujourd'hui s'afficheront ici.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Heure</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Motif</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {termines.map((item) => {
                                        const isAppointment = 'time' in item;
                                        const time = isAppointment ? item.time : format(new Date(item.date), "HH:mm");
                                        const patient = item.patient;
                                        const title = isAppointment ? item.title : item.reason;

                                        return (
                                            <TableRow key={`${isAppointment ? 'a' : 'c'}-${item.id}`} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-semibold text-muted-foreground">
                                                    {time}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {patient.first_name} {patient.last_name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground italic">{title || "Sans motif"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-normal">
                                                        {isAppointment ? "Rendez-vous" : "Directe"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigate(`/pat/${patient.id}`)}
                                                        className="gap-1 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Eye className="h-3 w-3" /> Dossier
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

                <TabsContent value="annulations">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {annulations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <XCircle className="h-16 w-16 text-muted-foreground opacity-20" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">Aucune annulation</h3>
                                    <p className="text-muted-foreground">Les rendez-vous annulés aujourd'hui s'afficheront ici.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Heure</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Motif</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {annulations.map((apt) => (
                                        <TableRow key={apt.id} className="hover:bg-muted/30 transition-colors opacity-70">
                                            <TableCell className="font-semibold text-muted-foreground line-through">
                                                {apt.time || (apt.date && apt.date.includes('T') ? apt.date.split('T')[1].substring(0, 5) : "--:--")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {apt.patient.first_name} {apt.patient.last_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground italic">{apt.title}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 font-normal">
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

                <TabsContent value="journal">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {journal.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <History className="h-16 w-16 text-muted-foreground opacity-20" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">Journal vide</h3>
                                    <p className="text-muted-foreground">L'activité de la journée s'affichera ici chronologiquement.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[120px]">Heure/Date</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {journal.map((item) => {
                                        const isAppointment = 'time' in item;
                                        const time = isAppointment ? item.time : format(new Date(item.date), "HH:mm");
                                        const status = isAppointment ? item.status : item.status; // simplified
                                        
                                        return (
                                            <TableRow key={`${isAppointment ? 'aj' : 'cj'}-${item.id}`} className="hover:bg-muted/30 transition-colors group">
                                                <TableCell className="text-muted-foreground font-mono">
                                                    {time}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.patient.first_name} {item.patient.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={isAppointment ? "outline" : "secondary"}>
                                                        {isAppointment ? "RDV" : "Directe"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        status === 'completed' ? 'default' :
                                                        status === 'in_progress' ? 'secondary' :
                                                        status === 'cancelled' ? 'destructive' : 'outline'
                                                    } className={status === 'in_progress' ? 'animate-pulse' : ''}>
                                                        {status === 'scheduled' ? 'Attente' :
                                                         status === 'checked_in' || status === 'in_progress' ? 'En cours' :
                                                         status === 'completed' ? 'Terminé' : 'Annulé'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/pat/${item.patient.id}`)}>
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
