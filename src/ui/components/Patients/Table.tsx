import { useState } from "react";
import { Patient } from "../Home/colums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ArrowUpDown,
  Search,
  MoreVertical,
  Eye,
  FileText,
  Archive,
  Trash,
  Undo2,
} from "lucide-react";
import { Input } from "../ui/input";
import Pagination from "../Pagination";
import { Button } from "../ui/button";
import NewPatientModal from "../NewPatient/NewPatientModal";
import { useNavigate } from "react-router-dom";
import { Users, User as UserIcon, UserPlus, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  formatLastVisit,
  getLastVisitBadgeClass,
  initialsAvatar,
} from "../../lib/utils";

import { Calendar as CalendarIcon } from "lucide-react"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "../../lib/utils"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter, X } from "lucide-react";
import api from "../../axios";
import { useAuth } from "../../context/auth-context";
function PatientsTable({
  patients,
  onPatientArchived,
  disableDateFilter,
}: {
  patients: Patient[];
  onPatientArchived: (
    id: string,
    status: "active" | "archived" | "deleted",
  ) => void;
  disableDateFilter?: boolean;
}) {
  const { user } = useAuth();
  const isMedical = user?.role === "doctor" || user?.role === "admin";
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<
    "name" | "lastVisit" | "createdAt" | null
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showArchived, setShowArchived] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined)

  // Advanced Filters
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [allergiesFilter, setAllergiesFilter] = useState<string>("all");

  const [confirmDialog, setConfirmDialog] = useState<{
    id: string;
    action: "archive" | "unarchive" | "delete";
  } | null>(null);

  const navigate = useNavigate();

  const itemsPerPage = 8;
  const filteredData = patients
    .filter((patient) => {
      const isArchived = patient.status === "archived";
      if (!showArchived && isArchived) return false;

      // Date Filtering
      if (!disableDateFilter && date?.from) {
        const from = startOfDay(date.from);
        const to = date.to ? endOfDay(date.to) : endOfDay(date.from);

        const lastVisitDate = patient.lastVisit ? new Date(patient.lastVisit) : null;
        const createdDate = patient.createdAt ? new Date(patient.createdAt) : null;

        const matchesVisit = lastVisitDate && isWithinInterval(lastVisitDate, { start: from, end: to });
        // Also check created date if visit date is missing or to catch new patients today
        const matchesCreated = createdDate && isWithinInterval(createdDate, { start: from, end: to });

        if (!matchesVisit && !matchesCreated) {
          return false;
        }
      }

      // Gender Filter
      if (genderFilter !== "all" && patient.gender !== genderFilter) {
        return false;
      }

      // Blood Type Filter
      if (bloodTypeFilter !== "all" && patient.bloodType !== bloodTypeFilter) {
        return false;
      }

      // Allergies Filter
      if (allergiesFilter === "yes" && !patient.allergies) {
        return false;
      }
      if (allergiesFilter === "no" && patient.allergies) {
        return false;
      }

      // Age Range Filter
      if (ageRangeFilter !== "all") {
        const age = patient.age || 0;
        if (ageRangeFilter === "0-18" && (age < 0 || age > 18)) return false;
        if (ageRangeFilter === "18-40" && (age < 18 || age > 40)) return false;
        if (ageRangeFilter === "40-60" && (age < 40 || age > 60)) return false;
        if (ageRangeFilter === "60+" && age < 60) return false;
      }

      const first = patient.firstname?.toLowerCase() || "";
      const last = patient.lastname?.toLowerCase() || "";
      const full1 = `${first} ${last}`;
      const full2 = `${last} ${first}`;
      const contact = patient.contact?.toLowerCase() || "";
      const tags = patient.tags?.toLowerCase() || "";
      const q = query.trim().toLowerCase();

      return (
        first.includes(q) ||
        last.includes(q) ||
        full1.includes(q) ||
        full2.includes(q) ||
        contact.includes(q) ||
        tags.includes(q)
      );
    })

  // Stats calculation — based on ALL patients (not affected by search/date/archive filters)
  // This matches the dashboard's statistics
  const totalFiltered = patients.length;
  
  const maleCount = patients.filter(p => {
    const g = (p.gender || "").toLowerCase();
    return g === "male" || g === "m" || g === "homme";
  }).length;
  
  const femaleCount = patients.filter(p => {
    const g = (p.gender || "").toLowerCase();
    return g === "female" || g === "f" || g === "femme";
  }).length;
  
  const avgAge = Math.round(patients.reduce((acc, p) => acc + (p.age || 0), 0) / (patients.length || 1));

  const sortedData = [...filteredData].sort((a, b) => {
    // ... existing sort logic ...
    if (!sortKey) return 0;

    if (sortKey === "name") {
      const aName = `${a.lastname || ""} ${a.firstname || ""}`.trim();
      const bName = `${b.lastname || ""} ${b.firstname || ""}`.trim();
      return sortOrder === "asc"
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    }

    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (sortKey === "lastVisit" || sortKey === "createdAt") {
      const aDate = new Date(aVal).getTime();
      const bDate = new Date(bVal).getTime();
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    }

    return 0;
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    try {
      if (confirmDialog.action === "delete") {
        await api.post("/patients/delete-patient", { id: confirmDialog.id });
        window.dispatchEvent(new Event("patients-updated"));
        onPatientArchived(confirmDialog.id, "deleted");
      } else {
        const newStatus =
          confirmDialog.action === "archive" ? "archived" : "active";

        await api.post("/patients/edit-patient", {
          id: confirmDialog.id,
          status: newStatus,
        });

        onPatientArchived(confirmDialog.id, newStatus);
      }
      setConfirmDialog(null);
    } catch (error) {
      console.error(`Failed to ${confirmDialog.action} patient`, error);
    }
  };

  return (
    <>
      <NewPatientModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "archive"
                ? "Archiver ce patient ?"
                : confirmDialog?.action === "delete"
                  ? "Supprimer ce patient ?"
                  : "Désarchiver ce patient ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "archive"
                ? "Son dossier restera accessible en lecture seule."
                : confirmDialog?.action === "delete"
                  ? "Cette action est irréversible ."
                  : "Il apparaîtra de nouveau dans la liste principale et sera éditable."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog?.action === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmDialog?.action === "archive"
                ? "Archiver"
                : confirmDialog?.action === "delete"
                  ? "Supprimer"
                  : "Désarchiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col p-2 sm:p-4 border rounded-2xl bg-card text-card-foreground shadow-lg w-full max-w-[900px] mx-auto gap-6 transition-all duration-300">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { label: "Total Patients", value: totalFiltered, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Hommes", value: maleCount, icon: UserIcon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "Femmes", value: femaleCount, icon: UserIcon, color: "text-pink-500", bg: "bg-pink-500/10" },
            { label: "Âge Moyen", value: avgAge || 0, icon: Info, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((stat, i) => (
            <div key={i} className={cn("flex flex-col p-3 rounded-xl border border-border/50", stat.bg)}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">{stat.label}</span>
              </div>
              <span className="text-xl font-bold">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Search Bar & Controls */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Patients ({filteredData.length})
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* search */}
            <div className="relative w-full max-w-md">
              <Input
                placeholder="Filtrer par prénom, nom ou téléphone..."
                className="pl-10 py-3 rounded-lg border border-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                value={query}
                onChange={handleQueryChange}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Search className="w-5 h-5" />
              </span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {!disableDateFilter && (
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y", { locale: fr })} -{" "}
                              {format(date.to, "LLL dd, y", { locale: fr })}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y", { locale: fr })
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="airplane-mode"
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                />
                <Label htmlFor="airplane-mode">Inclure archivés</Label>
              </div>

              {/* Advanced Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filtres avancés</span>
                    {(genderFilter !== "all" || ageRangeFilter !== "all" || bloodTypeFilter !== "all" || allergiesFilter !== "all") && (
                      <Badge variant="secondary" className="ml-1 px-1 h-5 text-[10px] bg-primary text-primary-foreground">
                        {[genderFilter, ageRangeFilter, bloodTypeFilter, allergiesFilter].filter(f => f !== "all").length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium leading-none">Filtres</h4>
                      {(genderFilter !== "all" || ageRangeFilter !== "all" || bloodTypeFilter !== "all" || allergiesFilter !== "all") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setGenderFilter("all");
                            setAgeRangeFilter("all");
                            setBloodTypeFilter("all");
                            setAllergiesFilter("all");
                          }}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="mr-1 w-3 h-3" />
                          Réinitialiser
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 pt-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="gender-filter">Sexe</Label>
                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                          <SelectTrigger id="gender-filter">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="Male">Homme</SelectItem>
                            <SelectItem value="Female">Femme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="age-filter">Tranche d'âge</Label>
                        <Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
                          <SelectTrigger id="age-filter">
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="0-18">0 - 18 ans</SelectItem>
                            <SelectItem value="18-40">18 - 40 ans</SelectItem>
                            <SelectItem value="40-60">40 - 60 ans</SelectItem>
                            <SelectItem value="60+">60+ ans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="blood-filter">Groupe Sanguin</Label>
                        <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                          <SelectTrigger id="blood-filter">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="allergies-filter">Allergies</Label>
                        <Select value={allergiesFilter} onValueChange={setAllergiesFilter}>
                          <SelectTrigger id="allergies-filter">
                            <SelectValue placeholder="Peu importe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Peu importe</SelectItem>
                            <SelectItem value="yes">A des allergies</SelectItem>
                            <SelectItem value="no">Sans allergies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => setIsOpen(true)}
                className="w-fit flex items-center space-x-2 active:scale-95"
              >
                <span>Ajouter un nouveau patient</span>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tag Color Hashing Helper */}
        {(() => {
          const getTagColor = (tag: string) => {
            const colors = [
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
              "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
              "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
              "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
            ];
            let hash = 0;
            for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
            return colors[Math.abs(hash) % colors.length];
          };
          (window as any).__getTagColor = getTagColor;
          return null;
        })()}

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <TooltipProvider>
            <Table className="min-w-[600px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="text-left cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex items-center">
                      Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                    </span>
                  </TableHead>

                  <TableHead>
                    Contact
                  </TableHead>

                  <TableHead
                    className="text-right cursor-pointer select-none w-[200px]"
                    onClick={() => handleSort("lastVisit")}
                  >
                    <span className="flex items-center">
                      Dernière visite
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </span>
                  </TableHead>

                  <TableHead className="text-right w-[60px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((patient) => {
                    const initials =
                      `${patient.firstname?.[0] || ""}${patient.lastname?.[0] || ""}`.toUpperCase();
                    const isArchived = patient.status === "archived";

                    return (
                      <TableRow
                        key={patient.id}
                        className={`transition-colors cursor-pointer ${isArchived
                          ? "hover:bg-transparent opacity-60 bg-muted/20"
                          : "hover:bg-accent"
                          }`}
                        onClick={() => {
                          navigate(`/pat/${patient.id}`);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                              <AvatarImage
                                src={initialsAvatar(initials)}
                                alt={initials}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground flex items-center gap-2">
                                {(patient.firstname || "").toUpperCase()}
                                {isArchived && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 px-1.5 text-[10px] bg-slate-100 text-slate-500 border-slate-200"
                                  >
                                    Archivé
                                  </Badge>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {patient.lastname || ""}
                              </span>
                              {patient.tags && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {patient.tags.split(",").map((tag, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className={cn("text-[9px] px-1.5 h-4 border", (window as any).__getTagColor?.(tag.trim()))}
                                    >
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {patient.contact || (
                            <span className="text-muted-foreground italic">
                              Non renseigné
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="">
                          {patient.lastVisit ? (
                            <Badge
                              variant="secondary"
                              className={`font-normal ${getLastVisitBadgeClass(patient.lastVisit)}`}
                            >
                              {formatLastVisit(patient.lastVisit)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-normal text-muted-foreground border-dashed"
                            >
                              Jamais consulté
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/pat/${patient.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Voir le dossier</TooltipContent>
                            </Tooltip>

                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => navigate(`/pat/${patient.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir le dossier
                                </DropdownMenuItem>

                                {isArchived && (
                                  <Tooltip>
                                    <TooltipContent>
                                      <p>Patient archivé - lecture seule</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Exporter (PDF)
                                </DropdownMenuItem>

                                {isMedical && (
                                  <>
                                    {!isArchived ? (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setConfirmDialog({
                                            id: patient.id,
                                            action: "archive",
                                          })
                                        }
                                      >
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archiver
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setConfirmDialog({
                                            id: patient.id,
                                            action: "unarchive",
                                          })
                                        }
                                      >
                                        <Undo2 className="mr-2 h-4 w-4" />
                                        Désarchiver
                                      </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() =>
                                        setConfirmDialog({
                                          id: patient.id,
                                          action: "delete",
                                        })
                                      }
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-muted p-4 rounded-full">
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-foreground">Aucun patient trouvé</p>
                          <p className="text-sm text-muted-foreground">Ajustez vos filtres ou ajoutez un nouveau patient.</p>
                        </div>
                        {(query || genderFilter !== "all" || ageRangeFilter !== "all" || bloodTypeFilter !== "all" || allergiesFilter !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setQuery("");
                              setGenderFilter("all");
                              setAgeRangeFilter("all");
                              setBloodTypeFilter("all");
                              setAllergiesFilter("all");
                            }}
                            className="mt-2"
                          >
                            <X className="mr-2 w-4 h-4" />
                            Réinitialiser tous les filtres
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TooltipProvider>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientsTable;
