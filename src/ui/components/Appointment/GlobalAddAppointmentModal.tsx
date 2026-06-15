import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, FileText, UserSearch, User, CalendarIcon } from "lucide-react";
import api from "../../axios";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { cn } from "../../lib/utils";

interface GlobalAddAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
}

export function GlobalAddAppointmentModal({
    isOpen,
    onClose,
    onSuccess,
    initialDate,
}: GlobalAddAppointmentModalProps) {
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [selectedPatientName, setSelectedPatientName] = useState<string>("");
    const [patients, setPatients] = useState<{ id: number; firstname: string; lastname: string }[]>([]);
    const [openCombobox, setOpenCombobox] = useState(false);

    const [title, setTitle] = useState("");
    const [date, setDate] = useState(""); // stored as yyyy-MM-dd for API
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Load patients on mount
    useEffect(() => {
        const loadPatients = async () => {
            const response = await api.get("/patients");
            const all = response.data;
            setPatients(all);
        };
        if (isOpen) {
            loadPatients();
        }
    }, [isOpen]);

    // Set initial date/time when modal opens with a date
    useEffect(() => {
        if (initialDate && isOpen) {
            setDate(format(initialDate, "yyyy-MM-dd"));
            setSelectedDate(initialDate);
            setTime(format(initialDate, "HH:mm"));
        } else if (isOpen && !date) {
            const today = new Date();
            setDate(format(today, "yyyy-MM-dd"));
            setSelectedDate(today);
        }
    }, [initialDate, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId) return;

        setIsLoading(true);

        try {
            const timePart = time || "";
            const dateString = timePart ? `${date}T${timePart}` : date;

            await api.post("/appointments", {
                patientId: Number(selectedPatientId),
                title,
                date: dateString,
                time: timePart,
                notes,
                status: "scheduled",
            });

            onSuccess();
            onClose();
            // Reset form
            setTitle("");
            setDate("");
            setSelectedDate(undefined);
            setTime("");
            setNotes("");
            setSelectedPatientId(null);
            setSelectedPatientName("");
        } catch (error) {
            console.error("Failed to add appointment", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <DialogHeader className="p-6 pb-2 bg-gradient-to-b from-primary/10 to-transparent">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Nouveau Rendez-vous
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sélectionnez un patient et planifiez le rendez-vous.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Patient</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between bg-muted/30 border-input/50"
                                >
                                    {selectedPatientName
                                        ? selectedPatientName
                                        : "Rechercher un patient..."}
                                    <UserSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Rechercher patient..." />
                                    <CommandList>
                                        <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                                        <CommandGroup>
                                            {patients.map((patient) => (
                                                <CommandItem
                                                    key={patient.id}
                                                    value={`${patient.firstname} ${patient.lastname}`}
                                                    onSelect={() => {
                                                        setSelectedPatientId(patient.id.toString());
                                                        setSelectedPatientName(`${patient.firstname} ${patient.lastname}`);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    {patient.firstname} {patient.lastname}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Motif
                        </Label>
                        <div className="relative">
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Consultation de suivi"
                                className="pl-9 bg-muted/30 border-input/50 focus:bg-background transition-all"
                                required
                            />
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Date</Label>
                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-muted/30 border-input/50 hover:bg-background",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate
                                            ? format(selectedDate, "dd/MM/yyyy")
                                            : "Sélectionner une date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => {
                                            setSelectedDate(d);
                                            setDate(d ? format(d, "yyyy-MM-dd") : "");
                                            setDatePickerOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="time"
                                className="text-sm font-medium flex justify-between"
                            >
                                Heure
                                <span className="text-xs font-normal text-muted-foreground">
                                    (Optionnel)
                                </span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="pl-9 bg-muted/30 border-input/50 focus:bg-background transition-all block"
                                />
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Détails supplémentaires..."
                            className="resize-none min-h-[80px] bg-muted/30 border-input/50 focus:bg-background transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="hover:bg-muted/50"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !selectedPatientId}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
