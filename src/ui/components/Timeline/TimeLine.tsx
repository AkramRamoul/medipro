import { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  UserPlus,
  Activity,
  Pill,
  User,
  Archive,
  RefreshCcw,
} from "lucide-react";

interface TimelineEvent {
  date: string;
  type: "Administrative" | "Consultation" | "Prescription";
  subType?: string;
  summary: string;
  details: string | null;
}

function TimeLine({ id }: { id: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await window.electronAPI.getPatientTimeline(id);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch timeline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Chargement de l'historique...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10 rounded-lg">
        <Activity className="w-12 h-12 opacity-20 mb-3" />
        <p className="font-medium">Aucun événement enregistré</p>
      </div>
    );
  }

  const getIcon = (type: string, subType?: string) => {
    if (type === "Consultation")
      return <FileText className="w-4 h-4 text-blue-500" />;
    if (type === "Ordonnance")
      return <Pill className="w-4 h-4 text-green-500" />;
    if (type === "Administrative") {
      if (subType === "Patient created")
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      if (subType === "Patient archived")
        return <Archive className="w-4 h-4 text-gray-500" />;
      if (subType === "Patient restored")
        return <RefreshCcw className="w-4 h-4 text-orange-500" />;
      return <User className="w-4 h-4 text-gray-400" />;
    }
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="pr-4">
      <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
        {events.map((event, index) => (
          <div key={index} className="relative pl-8">
            {/* Timeline Dot */}
            <div className="absolute left-[-9px] top-1 bg-background border rounded-full p-1 shadow-sm">
              {getIcon(event.type, event.subType)}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-xs">
                  <Calendar className="w-3 h-3" />
                  {new Date(event.date).toLocaleDateString("fr-FR")}
                </span>
                <span>–</span>
                <span className="uppercase tracking-wide text-xs font-semibold text-foreground/80">
                  {event.type === "Administrative" && event.subType
                    ? event.subType
                    : event.type}
                </span>
              </div>

              <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="font-semibold text-foreground text-sm">
                  {event.summary}
                </div>
                {event.details && (
                  <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line border-t pt-2">
                    {event.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeLine;
