import { useEffect, useState } from "react";
import { format, isSameYear, isToday, isTomorrow, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface AppointmentListProps {
  patientId: string;
  refreshTrigger: number;
}

export function AppointmentList({
  patientId,
  refreshTrigger,
}: AppointmentListProps) {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const all = await window.electronAPI.getAppointments(patientId);
      const now = new Date();
      const today = startOfDay(now);

      // Category logic: Upcoming includes everything from today onwards
      const upcomingList = all.filter((a) => new Date(a.date) >= today);
      const pastList = all.filter((a) => new Date(a.date) < today);

      setUpcoming(
        upcomingList.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      );
      setPast(
        pastList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    };
    fetchAppointments();
  }, [patientId, refreshTrigger]);

  const confirmDelete = async () => {
    if (deleteId) {
      await window.electronAPI.deleteAppointment(deleteId);
      window.location.reload();
    }
    setDeleteId(null);
  };

  const formatDateDisplay = (dateStr: string) => {
    // We treat the date as local time.
    // If it has a 'Z', it's UTC and will shift.
    // If we saved it as 'YYYY-MM-DDTHH:mm', it stays local.
    const date = new Date(dateStr);

    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

    let dayStr = "";
    if (isToday(date)) dayStr = "Aujourd'hui";
    else if (isTomorrow(date)) dayStr = "Demain";
    else dayStr = format(date, "EEEE d MMMM", { locale: fr });

    if (!isSameYear(date, new Date())) {
      dayStr += ` ${format(date, "yyyy")}`;
    }

    dayStr = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

    return {
      dayStr,
      timeStr: hasTime ? format(date, "HH:mm") : null,
    };
  };

  return (
    <>
      <div className="grid gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            Rendez-vous à venir
          </h3>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-muted-foreground/20 bg-muted/5 text-center">
              <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground font-medium">
                Aucun rendez-vous planifié.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Cliquez sur "Ajouter" pour planifier.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {upcoming.map((apt) => {
                const { dayStr, timeStr } = formatDateDisplay(apt.date);
                return (
                  <div
                    key={apt.id}
                    className="relative group flex items-start justify-between p-4 border border-border/60 rounded-xl bg-card hover:bg-accent/5 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl opacity-70 group-hover:opacity-100 transition-opacity" />

                    <div className="flex gap-4 items-start pl-2">
                      <div className="flex flex-col items-center justify-center min-w-[60px] h-[60px] bg-primary/5 rounded-lg border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <span className="text-xs font-bold uppercase text-primary/70">
                          {format(new Date(apt.date), "MMM", { locale: fr })}
                        </span>
                        <span className="text-xl font-extrabold text-primary">
                          {format(new Date(apt.date), "dd")}
                        </span>
                      </div>

                      <div>
                        <div className="font-semibold text-lg leading-none mb-1.5 group-hover:text-primary transition-colors">
                          {apt.title}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground/80">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {dayStr}
                          </span>
                          {timeStr && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                              <Clock className="h-3 w-3" />
                              {timeStr}
                            </span>
                          )}
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-muted-foreground/80 mt-2 line-clamp-2 pl-4 border-l-2 border-muted italic">
                            {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(apt.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground/80">
            <div className="p-1.5 bg-muted rounded-md">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            Historique
          </h3>
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground italic pl-2">
              Aucun historique disponible.
            </p>
          ) : (
            <div className="grid gap-2 opacity-80 hover:opacity-100 transition-opacity">
              {past.map((apt) => {
                const { dayStr, timeStr } = formatDateDisplay(apt.date);
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      <div>
                        <div className="font-medium text-foreground/90">
                          {apt.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span>{dayStr}</span>
                          {timeStr && <span>• {timeStr}</span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(apt.id)}
                      className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-transparent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le
              rendez-vous de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
