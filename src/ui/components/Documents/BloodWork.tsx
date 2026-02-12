"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  Calendar as CalendarIcon,
  User,
  FlaskConical,
  Search,
  AlertTriangle,
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";
import { Patient } from "../../type";
import { Separator } from "../ui/separator";

const bloodWorkSchema = z.object({
  patientName: z.string().min(2),
  date: z.string(),
  results: z.array(z.string().min(1)),
});

export function BloodWork({
  patient,
  onClose,
  refreshDocuments,
}: {
  patient: Patient;
  onClose: () => void;
  refreshDocuments: () => void;
}) {
  const form = useForm<z.infer<typeof bloodWorkSchema>>({
    resolver: zodResolver(bloodWorkSchema),
    defaultValues: {
      patientName: `${patient.last_name} ${patient.first_name}`,
      date: new Date().toISOString().split("T")[0],
      results: [],
    },
  });

  const [currentItem, setCurrentItem] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string }[]>([]);
  const [allBilans, setAllBilans] = useState<{ name: string }[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electronAPI.getBilans().then(setAllBilans).catch(console.error);
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addItem(name?: string) {
    const itemToAdd = (name || currentItem).trim();
    if (!itemToAdd) return;
    const currentResults = form.getValues("results");
    if (!currentResults.includes(itemToAdd)) {
      form.setValue("results", [...currentResults, itemToAdd]);
    }
    setCurrentItem("");
    setSuggestions([]);
    setHighlightedIndex(-1);
  }

  function handleSuggestionClick(name: string) {
    setCurrentItem(name);
    setSuggestions([]);
    setHighlightedIndex(-1);
  }

  function handleInputChange(value: string) {
    setCurrentItem(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = allBilans
      .filter((b) => b.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10);
    setSuggestions(filtered);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex].name);
      } else {
        addItem();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  }

  function removeItem(index: number) {
    const currentResults = form.getValues("results");
    const updated = currentResults.filter((_, i) => i !== index);
    form.setValue("results", updated);
  }

  async function onSubmit(values: z.infer<typeof bloodWorkSchema>) {
    try {
      await window.electronAPI.createDocument({
        patientId: patient.id,
        type: "blood",
        content: values,
        documentDate: new Date(values.date).toISOString(),
      });
      refreshDocuments();
      onClose();
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none">
      <CardHeader className="pb-4 border-b mb-6">
        <CardTitle className="flex items-center gap-3 text-xl text-primary">
          <FlaskConical className="w-6 h-6" />
          Demande de Bilan
        </CardTitle>
        <p className="text-muted-foreground mt-1">
          Créez une nouvelle demande d'analyses pour {patient.first_name}{" "}
          {patient.last_name}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Patient
                    </FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-10 rounded-xl",
                              !field.value && "text-muted-foreground",
                              !isToday(parseISO(field.value)) && "border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100"
                            )}
                          >
                            {field.value ? (
                              format(parseISO(field.value), "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={parseISO(field.value)}
                          onSelect={(date) => field.onChange(date?.toISOString().split("T")[0])}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    {!isToday(parseISO(field.value)) && (
                      <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1 mt-1 animate-pulse">
                        <AlertTriangle className="h-3 w-3" />
                        Date modifiée manuellement
                      </span>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Liste des Analyses
              </FormLabel>

              <div className="relative space-y-2" ref={suggestionsRef}>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Search className="w-4 h-4" />
                    </div>
                    <Input
                      placeholder="Rechercher une analyse..."
                      className="pl-9 pr-9 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                      value={currentItem}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                    />
                    {currentItem && (
                      <button
                        onClick={() => handleInputChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}

                    {suggestions.length > 0 && (
                      <div className="absolute z-50 w-full bg-popover/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl mt-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                        <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                          {suggestions.map((s, index) => (
                            <div
                              key={index}
                              className={`group/item flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg transition-all text-left ${index === highlightedIndex
                                ? "bg-primary text-primary-foreground shadow-md scale-[1.02] z-10"
                                : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                              onMouseDown={() => handleSuggestionClick(s.name)}
                            >
                              <div className={`p-1.5 rounded-md transition-colors ${index === highlightedIndex
                                ? "bg-primary-foreground/20"
                                : "bg-muted group-hover/item:bg-primary/10 group-hover/item:text-primary"
                                }`}>
                                <FlaskConical className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium flex-1">{s.name}</span>
                              <Plus className={`w-4 h-4 opacity-0 transition-opacity ${index === highlightedIndex ? "opacity-100" : "group-hover/item:opacity-100"
                                }`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => addItem()}
                    className="h-11 px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-xl border-none"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg border min-h-[150px] p-2 space-y-1">
                {form.watch("results").length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 opacity-50">
                    <FlaskConical className="w-6 h-6 mb-2" />
                    <p>Aucune analyse ajoutée pour le moment</p>
                  </div>
                ) : (
                  form.watch("results").map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-card rounded-md border shadow-sm group hover:border-primary/50 transition-colors"
                    >
                      <span className="font-medium text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
              <Button type="submit" className="gap-2 min-w-[150px]">
                <Save className="w-4 h-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
