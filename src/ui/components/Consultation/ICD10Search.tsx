import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverAnchor,
} from "../ui/popover";
import { ICD10 } from "../../type";
import commonICD10 from "../../assets/icd10_common_fr.json";

interface ICD10SearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function ICD10Search({ value, onChange, placeholder }: ICD10SearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState<ICD10[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local query when value prop changes externally
    useEffect(() => {
        if (value !== query) {
            setQuery(value || "");
        }
    }, [value]);

    useEffect(() => {
        const search = async () => {
            // Don't search if query is empty unless we want to show default suggestions
            if (!open) return;

            setLoading(true);
            try {
                const data = await window.electronAPI.searchICD10(query);

                // If no results and it's the first time/empty table, seed with common codes
                if (data.length === 0 && query === "") {
                    await window.electronAPI.importICD10(commonICD10);
                    const seededData = await window.electronAPI.searchICD10("");
                    setResults(seededData);
                } else {
                    setResults(data);
                }
            } catch (error) {
                console.error("Failed to search ICD-10:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query, open]);

    const handleSelect = (item: ICD10) => {
        const newValue = `${item.code} - ${item.label}`;
        setQuery(newValue);
        onChange(newValue);
        setOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <Popover open={open && (results.length > 0 || loading)} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                    <div className="relative">
                        <Input
                            value={query}
                            onChange={(e) => {
                                const val = e.target.value;
                                setQuery(val);
                                onChange(val);
                                if (!open) setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            placeholder={placeholder || "Saisir un diagnostic ou rechercher..."}
                            className="pr-10 bg-muted/30 focus-visible:ring-blue-500/50"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4 opacity-50" />
                            )}
                        </div>
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()} // Keep focus on Input
                >
                    <Command shouldFilter={false}>
                        <CommandList className="max-h-[300px]">
                            <CommandGroup heading="Suggestions CIM-10">
                                {results.map((item) => (
                                    <CommandItem
                                        key={item.code}
                                        value={item.code + " " + item.label}
                                        onSelect={() => handleSelect(item)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 text-blue-500",
                                                value.startsWith(item.code) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[10px] text-blue-600 uppercase tracking-wider">{item.code}</span>
                                            <span className="text-sm leading-tight">{item.label}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
