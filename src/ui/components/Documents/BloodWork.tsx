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
import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  Calendar,
  User,
  FlaskConical,
} from "lucide-react";
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

  function addItem() {
    if (!currentItem.trim()) return;
    const updated = [...form.getValues("results"), currentItem.trim()];
    form.setValue("results", updated);
    setCurrentItem("");
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
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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

              <div className="flex gap-2">
                <Input
                  placeholder="Ex: FNS, Créatinine..."
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addItem}
                  className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                  variant="ghost"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
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
