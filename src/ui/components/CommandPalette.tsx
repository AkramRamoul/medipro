import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings,
    User,
    Users,
    FileText,
    LayoutDashboard,
    PlusCircle,
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

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

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
                const data = await window.electronAPI.globalSearch(query);
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [query, open]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

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

                    {results.length > 0 && (
                        <CommandGroup heading="Résultats">
                            {results.map((result) => (
                                <CommandItem
                                    key={`${result.type}-${result.id}`}
                                    onSelect={() => {
                                        runCommand(() => {
                                            if (result.type === "patient") {
                                                navigate(`/pat/${result.id}`);
                                            } else if (result.type === "consultation") {
                                                navigate(`/pat/${result.patientId}`);
                                            }
                                        });
                                    }}
                                >
                                    {result.type === "patient" ? (
                                        <User className="mr-2 h-4 w-4" />
                                    ) : (
                                        <FileText className="mr-2 h-4 w-4" />
                                    )}
                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    <CommandGroup heading="Actions Rapides">
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/"))}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Tableau de bord</span>
                            <CommandShortcut>⌘D</CommandShortcut>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/all-patients"))}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            <span>Tous les patients</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/prescriptions", { state: { openNewPrescription: true } }))}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Nouvelle Ordonnance</span>
                            <CommandShortcut>⌘N</CommandShortcut>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/settings"))}
                        >
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
