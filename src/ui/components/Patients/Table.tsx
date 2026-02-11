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
  Plus,
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
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";
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
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<
    "name" | "lastVisit" | "createdAt" | null
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showArchived, setShowArchived] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

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
          // Special case: if filtering for Today, and patient has NO dates but was just added (optimistic UI), maybe show? 
          // For now, strict filtering based on data.
          return false;
        }
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
    .sort((a, b) => {
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
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    try {
      if (confirmDialog.action === "delete") {
        await window.electronAPI.deletePatient(confirmDialog.id);
        window.dispatchEvent(new Event("patients-updated"));
        onPatientArchived(confirmDialog.id, "deleted");
      } else {
        const newStatus =
          confirmDialog.action === "archive" ? "archived" : "active";

        await window.electronAPI.editPatient({
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

      <div className="flex flex-col p-2 sm:p-4 border rounded-2xl bg-card text-card-foreground shadow-lg w-full max-w-[900px] mx-auto">
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

              <Button
                onClick={() => setIsOpen(true)}
                className="w-fit flex items-center space-x-2 bg-primary  hover:bg-primary/90"
              >
                <span>Ajouter un nouveau patient</span>
                <Plus className="w-4 h-4 font-bold" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <TooltipProvider>
            <Table className="min-w-[600px] w-full">
              <TableHeader>
                <TableRow className="bg-muted rounded-lg">
                  <TableHead
                    className="text-muted-foreground text-left cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex items-center">
                      Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                    </span>
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Contact
                  </TableHead>

                  <TableHead
                    className="text-muted-foreground text-right cursor-pointer select-none w-[200px]"
                    onClick={() => handleSort("lastVisit")}
                  >
                    <span className="flex items-center">
                      Dernière visite
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </span>
                  </TableHead>

                  <TableHead className="text-muted-foreground text-right w-[60px]">
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
                                      className="text-[10px] px-1.5 h-4 bg-primary/5 text-primary border-primary/10"
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
                      Aucun patient correspondant trouvé.
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
