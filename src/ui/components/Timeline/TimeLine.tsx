import { useEffect, useState } from "react";
import api from "../../axios";
import {
  Calendar,
  FileText,
  UserPlus,
  Activity,
  Pill,
  User,
  Archive,
  RefreshCcw,
  FlaskConical,
  Search,
  X,
  Filter,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

interface TimelineEvent {
  date: string;
  type: "Administrative" | "Consultation" | "Ordonnance" | "Document" | "Biologie";
  subType?: string;
  summary: string;
  details: string | null;
}

function TimeLine({ id }: { id: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  const eventTypes = [
    "All",
    "Consultation",
    "Ordonnance",
    "Document",
    "Biologie",
    "Administrative",
  ];

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/patients/${id}/timeline`);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch timeline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();

    const refetch = () => {
      fetchTimeline();
    };
    window.addEventListener("consultations-updated", refetch);
    window.addEventListener("lab-results-updated", refetch);
    window.addEventListener("documents-updated", refetch);

    return () => {
      window.removeEventListener("consultations-updated", refetch);
      window.removeEventListener("lab-results-updated", refetch);
      window.removeEventListener("documents-updated", refetch);
    };
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
      if (subType === "Patient created" || subType === "Patient créé")
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      if (subType === "Patient archived" || subType === "Patient archivé")
        return <Archive className="w-4 h-4 text-gray-500" />;
      if (subType === "Patient restored" || subType === "Patient restauré")
        return <RefreshCcw className="w-4 h-4 text-orange-500" />;
      return <User className="w-4 h-4 text-gray-400" />;
    }
    if (type === "Document")
      return <FileText className="w-4 h-4 text-orange-500" />;
    if (type === "Biologie")
      return <FlaskConical className="w-4 h-4 text-teal-500" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const filteredEvents = events.filter((event) => {
    const matchesType =
      selectedType === "All" ||
      (selectedType === "Administrative" && event.type === "Administrative") ||
      event.type === selectedType;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      event.summary.toLowerCase().includes(searchLower) ||
      (event.details && event.details.toLowerCase().includes(searchLower)) ||
      (event.subType && event.subType.toLowerCase().includes(searchLower));

    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 pr-4">
      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'historique..."
              className="pl-9 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-2">
            {eventTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-primary/10 transition-colors uppercase text-[10px] tracking-wider font-bold px-3 py-1",
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground border-muted-foreground/30"
                )}
                onClick={() => setSelectedType(type)}
              >
                {type === "All" ? "Tout" : type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
          <Activity className="w-12 h-12 opacity-20 mb-3" />
          <p className="font-medium">Aucun résultat trouvé</p>
          <p className="text-xs">Essayez de modifier vos filtres ou votre recherche</p>
          {(searchTerm || selectedType !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("All");
              }}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
          {filteredEvents.map((event, index) => (
            <div
              key={index}
              className="relative pl-8 animate-in fade-in slide-in-from-left-2 duration-300"
            >
              {/* Timeline Dot */}
              <div className="absolute left-[-9px] top-1 bg-background border rounded-full p-1 shadow-sm transition-transform hover:scale-110">
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
      )}
    </div>
  );
}

export default TimeLine;
