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

// Define Zod Schema for Validation
const patientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Age must be at least 1"),
  gender: z.enum(["Male", "Female"]),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: PatientData) => {
    console.log("Form submitted:", data); // Debugging log
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
              <Label htmlFor="firstName" className="text-foreground">
                Nom
              </Label>
              <Input
                {...register("first_name")}
                id="firstName"
                placeholder="Entrez le nom"
                className="bg-background text-foreground"
              />
              {errors.first_name && (
                <p className="text-destructive text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-foreground">
                Prénom
              </Label>
              <Input
                {...register("last_name")}
                id="lastName"
                placeholder="Entrez le prénom"
                className="bg-background text-foreground"
              />
              {errors.last_name && (
                <p className="text-destructive text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender & Age */}
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
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground">
                      <SelectItem value="Male">Mâle</SelectItem>
                      <SelectItem value="Female">Femmelle</SelectItem>
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
              <Label htmlFor="age" className="text-foreground">
                Âge
              </Label>
              <Input
                {...register("age")}
                id="age"
                type="number"
                placeholder="Enter age"
                className="bg-background text-foreground"
              />
              {errors.age && (
                <p className="text-destructive text-sm">{errors.age.message}</p>
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
                Poids (Facultative)
              </Label>
              <Input
                {...register("weight")}
                id="weight"
                type="number"
                placeholder="Enter weight (kg)"
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
