import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings,
    User,
    Users,
    FileText,
    LayoutDashboard,
    PlusCircle,
    Calendar,
    Banknote,
    Moon,
    Sun,
    Activity
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "./ui/command";
import { SearchResult } from "../type";
import api from "../axios";
import { useTheme } from "./theme-provider";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case "k":
                        e.preventDefault();
                        setOpen((open) => !open);
                        break;
                    case "d":
                        e.preventDefault();
                        runCommand(() => navigate("/"));
                        break;
                    case "p":
                        e.preventDefault();
                        runCommand(() => navigate("/all-patients"));
                        break;
                    case "c":
                        e.preventDefault();
                        runCommand(() => navigate("/consultations"));
                        break;
                    case "r":
                        e.preventDefault();
                        runCommand(() => navigate("/appointments"));
                        break;
                    case "e":
                        e.preventDefault();
                        runCommand(() => navigate("/expenses"));
                        break;
                    case "n":
                        e.preventDefault();
                        runCommand(() => navigate("/prescriptions", { state: { openNewPrescription: true } }));
                        break;
                    case "t":
                        e.preventDefault();
                        runCommand(() => setTheme(theme === "light" ? "dark" : "light"));
                        break;
                    case "s":
                        e.preventDefault();
                        runCommand(() => navigate("/settings"));
                        break;
                }
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [navigate, runCommand, setTheme, theme]);

    React.useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
            return;
        }

        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/patients/search?q=${query}`);
                setResults(response.data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [query, open]);

    const patients = results.filter(r => r.type === "patient");
    const consultations = results.filter(r => r.type === "consultation");

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Recherche globale (patients, consultations...)"
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? "Recherche en cours..." : "Pas de résultats."}
                    </CommandEmpty>

                    {patients.length > 0 && (
                        <CommandGroup heading="Patients">
                            {patients.map((result) => (
                                <CommandItem
                                    key={`${result.type}-${result.id}`}
                                    onSelect={() => runCommand(() => navigate(`/pat/${result.id}`))}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {consultations.length > 0 && (
                        <CommandGroup heading="Consultations">
                            {consultations.map((result) => (
                                <CommandItem
                                    key={`${result.type}-${result.id}`}
                                    onSelect={() => runCommand(() => navigate(`/pat/${result.patientId}`))}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.length > 0 && <CommandSeparator />}

                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Tableau de bord</span>
                            <CommandShortcut>⌘D</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/all-patients"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Tous les patients</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/consultations"))}>
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Consultations</span>
                            <CommandShortcut>⌘C</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/appointments"))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Rendez-vous</span>
                            <CommandShortcut>⌘R</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/expenses"))}>
                            <Banknote className="mr-2 h-4 w-4" />
                            <span>Dépenses</span>
                            <CommandShortcut>⌘E</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Actions">
                        <CommandItem onSelect={() => runCommand(() => navigate("/prescriptions", { state: { openNewPrescription: true } }))}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Nouvelle Ordonnance</span>
                            <CommandShortcut>⌘N</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Paramètres & Thème">
                        <CommandItem onSelect={() => runCommand(() => setTheme(theme === "light" ? "dark" : "light"))}>
                            {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                            <span>Changer le thème</span>
                            <CommandShortcut>⌘T</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Paramètres</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
