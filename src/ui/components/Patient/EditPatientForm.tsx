"use client";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define Zod Schema for Validation
const patientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Age must be at least 1"),
  gender: z.enum(["Male", "Female"]),
  contact: z.string().optional(),
  weight: z.coerce.number().optional(),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

type PatientData = z.infer<typeof patientSchema>;

export function EditPatientForm({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      weight: undefined,
      contact: undefined,
      address: undefined,
      bloodType: undefined,
      medicalHistory: undefined,
      allergies: undefined,
      notes: undefined,
    },
  });

  useEffect(() => {
    if (id) {
      window.electronAPI
        .getpatient(id)
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        .then((data: any) => {
          const patientData = data[0] ? { ...data[0] } : null;
          console.log("📢 Extracted Patient Data:", patientData);

          if (patientData) {
            reset(patientData);
          }
        })
        .catch((error: Error) =>
          console.error("Error fetching patient:", error)
        )
        .finally(() => setLoading(false));
    }
  }, [id, reset]);

  const handleSave = async (data: PatientData) => {
    try {
      const updatedData = { id, ...data };
      console.log("Submitting Patient Data:", updatedData);

      await window.electronAPI.editPatient(updatedData);

      toast.success("Patient mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Échec de la mise à jour du patient. Veuillez réessayer.");
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Card
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-[90%] mx-auto mt-5 bg-card text-card-foreground"
    >
      <form onSubmit={handleSubmit(handleSave)}>
        <CardHeader>
          <CardTitle>Modifier le patient</CardTitle>
          <CardDescription>
            Modifiez les informations du patient ci-dessous.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          {/* Prénom & Nom */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nom</Label>
              <Input
                {...register("first_name")}
                id="firstName"
                placeholder="Entrer le prénom"
              />
              {errors.first_name && (
                <p className="text-destructive text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Prénom</Label>
              <Input
                {...register("last_name")}
                id="lastName"
                placeholder="Entrer le nom"
              />
              {errors.last_name && (
                <p className="text-destructive text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Âge & Sexe */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="age">Âge</Label>
              <Input
                {...register("age")}
                id="age"
                type="number"
                placeholder="Entrer l'âge"
              />
              {errors.age && (
                <p className="text-destructive text-sm">{errors.age.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Sexe</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Sélectionner le sexe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Homme</SelectItem>
                      <SelectItem value="Female">Femmelle</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Contact & Adresse */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact (optionnel)</Label>
              <Input
                {...register("contact")}
                id="contact"
                placeholder="Entrer le numéro de contact"
              />
              {errors.contact && (
                <p className="text-destructive text-sm">
                  {errors.contact.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Input
                {...register("address")}
                id="address"
                placeholder="Entrer l'adresse"
              />
            </div>
          </div>

          {/* Groupe sanguin & Poids */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bloodType">Groupe sanguin (optionnel)</Label>
              <Controller
                name="bloodType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Sélectionner le groupe sanguin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Antécédents médicaux, Allergies, Remarques */}
          <div className="grid gap-2">
            <Label htmlFor="medicalHistory">
              Antécédents médicaux (optionnel)
            </Label>
            <Textarea
              {...register("medicalHistory")}
              id="medicalHistory"
              placeholder="Entrer les antécédents médicaux"
            />
          </div>

          <Label htmlFor="allergies">Allergies (optionnel)</Label>
          <Textarea
            {...register("allergies")}
            placeholder="Entrer les allergies"
          />

          <Label htmlFor="notes">Remarques (optionnel)</Label>
          <Textarea {...register("notes")} placeholder="Autres remarques" />
        </CardContent>

        <CardFooter className="justify-end">
          <Button size="lg" type="submit" className="text-white">
            Enregistrer
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
