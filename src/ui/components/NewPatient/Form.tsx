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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";

// Define Zod Schema for Validation
const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Age must be at least 1"),
  gender: z.enum(["Male", "Female"]),
  contact: z.string().min(5, "Contact must be valid"),
  weight: z.coerce.number().min(1, "Weight must be a positive number"),
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
  } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: PatientData) => {
    onSave(data);
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new patient</CardTitle>
        <CardDescription>
          Fill out the form below to add a new patient to the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input {...register("name")} id="name" placeholder="Enter name" />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Age */}
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
          <Select {...register("gender")}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
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
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between space-x-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
