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
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";

const patientSchema = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit comporter au moins 2 caractères."),
  last_name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  dateOfBirth: z.string().min(1, "La date de naissance est requise."),
  gender: z.enum(["Male", "Female"], {
    error: "Le sexe est requis.",
  }),
  contact: z.string().optional(),
  weight: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type PatientData = z.infer<typeof patientSchema>;

interface AddPatientFormProps {
  onClose: () => void;
  onSave: (data: PatientData) => void;
}

export function AddPatientForm({ onClose, onSave }: AddPatientFormProps) {
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [selectedDob, setSelectedDob] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: PatientData) => {
    onSave(data);
    onClose();
  };

  return (
    <Card className="bg-background my-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-foreground">Add a new patient</CardTitle>
          <CardDescription className="text-muted-foreground">
            Remplissez le formulaire ci-dessous pour ajouter un nouveau patient
            au système.{" "}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          {/* First Name & Last Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-foreground">
                Nom
              </Label>
              <Input
                {...register("last_name")}
                id="lastName"
                placeholder="Entrez le nom"
                className="bg-background text-foreground"
              />
              {errors.last_name && (
                <p className="text-destructive text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-foreground">
                Prénom
              </Label>
              <Input
                {...register("first_name")}
                id="firstName"
                placeholder="Entrez le prénom"
                className="bg-background text-foreground"
              />
              {errors.first_name && (
                <p className="text-destructive text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gender" className="text-foreground">
                Sexe
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="gender"
                      className="bg-background text-foreground"
                    >
                      <SelectValue placeholder="Sélectionner le sexe" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground">
                      <SelectItem value="Male">Homme</SelectItem>
                      <SelectItem value="Female">Femelle</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="text-destructive text-sm">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth" className="text-foreground">
                Date de naissance
              </Label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <Popover open={dobPickerOpen} onOpenChange={setDobPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background text-foreground",
                          !selectedDob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDob
                          ? format(selectedDob, "dd/MM/yyyy")
                          : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDob}
                        onSelect={(d) => {
                          setSelectedDob(d);
                          field.onChange(d ? format(d, "yyyy-MM-dd") : "");
                          setDobPickerOpen(false);
                        }}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.dateOfBirth && (
                <p className="text-destructive text-sm">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact & Weight */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact" className="text-foreground">
                Num tel (Facultative)
              </Label>
              <Input
                {...register("contact")}
                id="contact"
                placeholder="Entrez le numéro de téléphone"
                className="bg-background text-foreground"
              />
              {errors.contact && (
                <p className="text-destructive text-sm">
                  {errors.contact.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight" className="text-foreground">
                Poids (kg, Facultatif)
              </Label>
              <Input
                {...register("weight")}
                id="weight"
                type="number"
                placeholder="ex: 70"
                className="bg-background text-foreground"
              />
              {errors.weight && (
                <p className="text-destructive text-sm">
                  {errors.weight.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="special-notes" className="text-foreground">
              notes supplémentaires (Facultative)
            </Label>
            <Textarea
              {...register("notes")}
              id="special-notes"
              placeholder="Des notes supplémentaires ."
              className="bg-background text-foreground"
            />
          </div>
        </CardContent>

        <CardFooter className="justify-between space-x-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="text-foreground"
          >
            Annuler
          </Button>

          <Button type="submit">Enregistrer</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
