import { useEffect, useState } from "react";
import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function ClinicAppointmentList() {
  const [todayList, setTodayList] = useState<any[]>([]);
  const [weekList, setWeekList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const all = await window.electronAPI.getAllAppointments();

      const now = new Date();

      function endOfDay(date: Date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
      }

      const today = all.filter((a) => isToday(new Date(a.date)));

      const next14Days = endOfDay(new Date());
      next14Days.setDate(next14Days.getDate() + 14);

      const upcoming = all.filter((a) => {
        const d = new Date(a.date);
        return d > endOfDay(now) && d <= next14Days;
      });

      setTodayList(
        today.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      );
      setWeekList(
        upcoming.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      );
    };
    fetchAppointments();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Supprimer ce rendez-vous ?")) {
      await window.electronAPI.deleteAppointment(id);
      window.location.reload();
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

    return {
      dateObj: date,
      timeStr: hasTime ? format(date, "HH:mm") : null,
      dayStr: format(date, "EEEE d", { locale: fr }),
    };
  };

  return (
    <div className="grid gap-8 p-6">
      {/* Today Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          Aujourd'hui
        </h2>

        {todayList.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-xl border-muted-foreground/20 bg-muted/5 text-center">
            <p className="text-muted-foreground">
              Aucun rendez-vous pour aujourd'hui.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {todayList.map((apt) => {
              const { timeStr } = formatDateDisplay(apt.date);
              return (
                <div
                  key={apt.id}
                  onClick={() => navigate(`/pat/${apt.patientId}`)}
                  className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-2xl font-bold text-primary min-w-[60px] text-center">
                      {timeStr || "--:--"}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {apt.patientFirstName} {apt.patientLastName}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {apt.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Voir Patient
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(e, apt.id)}
                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Week Section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground/80">
          À venir (14 jours)
        </h2>
        {weekList.length === 0 ? (
          <p className="text-muted-foreground italic">
            Aucun rendez-vous planifié prochainement.
          </p>
        ) : (
          <div className="grid gap-3">
            {weekList.map((apt) => {
              const { dayStr, timeStr } = formatDateDisplay(apt.date);
              return (
                <div
                  key={apt.id}
                  onClick={() => navigate(`/pat/${apt.patientId}`)}
                  className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[120px] font-medium text-muted-foreground capitalize border-r pr-4">
                      {dayStr}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {apt.patientFirstName} {apt.patientLastName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                        {timeStr && (
                          <span className="flex items-center gap-1 bg-muted px-1.5 rounded text-xs">
                            <Clock className="h-3 w-3" /> {timeStr}
                          </span>
                        )}
                        <span>{apt.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
