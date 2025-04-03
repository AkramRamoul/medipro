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

// Define Zod Schema for Validation
const patientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Age must be at least 1"),
  gender: z.enum(["Male", "Female"]),
  contact: z.string().min(5, "Contact must be valid"),
  weight: z.coerce.number().min(1, "Weight must be a positive number"),
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
    <Card
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Add a new patient</CardTitle>
          <CardDescription>
            Fill out the form below to add a new patient to the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* First Name, Last Name & Age in same row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                {...register("first_name")}
                id="firstName"
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                {...register("last_name")}
                id="lastName"
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                {...register("age")}
                id="age"
                type="number"
                placeholder="Enter age"
              />
              {errors.age && (
                <p className="text-red-500 text-sm">{errors.age.message}</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender.message}</p>
            )}
          </div>

          {/* Contact */}
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact</Label>
            <Input
              {...register("contact")}
              id="contact"
              placeholder="Enter contact number"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm">{errors.contact.message}</p>
            )}
          </div>

          {/* Weight */}
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight</Label>
            <Input
              {...register("weight")}
              id="weight"
              type="number"
              placeholder="Enter weight (kg)"
            />
            {errors.weight && (
              <p className="text-red-500 text-sm">{errors.weight.message}</p>
            )}
          </div>

          {/* Special Notes */}
          <div className="grid gap-2">
            <Label htmlFor="special-notes">Special Notes (Optional)</Label>
            <Textarea
              id="special-notes"
              placeholder="Any additional notes for the patient."
              {...register("notes")}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            type="button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            type="submit"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Save
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
