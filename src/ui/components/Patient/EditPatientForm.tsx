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
  contact: z.string().min(5, "Contact must be valid"),
  weight: z.coerce.number().min(1, "Weight must be a positive number"),
  address: z.string().min(5, "Address must be valid"),
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
      first_name: "",
      last_name: "",
      age: 0,
      gender: "Male",
      contact: "",
      weight: 0,
      address: "",
      bloodType: "",
      medicalHistory: "",
      allergies: "",
      notes: "",
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

      toast.success("Patient updated successfully!");
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient. Please try again.");
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
      className="w-full max-w-[90%] mx-auto mt-5 bg-white text-black dark:bg-gray-900 dark:text-white"
    >
      <form onSubmit={handleSubmit(handleSave)}>
        <CardHeader>
          <CardTitle className="text-black dark:text-white">
            Edit Patient
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Modify the patient details below.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          {/* First Name & Last Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-left dark:text-white">
                First Name
              </Label>
              <Input
                {...register("first_name")}
                id="firstName"
                placeholder="Enter first name"
                className="bg-white dark:bg-gray-800 dark:text-white"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-left dark:text-white">
                Last Name
              </Label>
              <Input
                {...register("last_name")}
                id="lastName"
                placeholder="Enter last name"
                className="bg-white dark:bg-gray-800 dark:text-white"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="age" className="text-left dark:text-white">
                Age
              </Label>
              <Input
                {...register("age")}
                id="age"
                type="number"
                placeholder="Enter age"
                className="bg-white dark:bg-gray-800 dark:text-white"
              />
              {errors.age && (
                <p className="text-red-500 text-sm">{errors.age.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender" className="text-left dark:text-white">
                Gender
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="gender"
                      className="bg-white dark:bg-gray-800 dark:text-white"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-white">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Contact & Address */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact" className="text-left dark:text-white">
                Contact
              </Label>
              <Input
                {...register("contact")}
                id="contact"
                placeholder="Enter contact number"
                className="bg-white dark:bg-gray-800 dark:text-white"
              />
              {errors.contact && (
                <p className="text-red-500 text-sm">{errors.contact.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="text-left dark:text-white">
                Address
              </Label>
              <Input
                {...register("address")}
                id="address"
                placeholder="Enter address"
                className="bg-white dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Blood Type & Weight */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bloodType" className="text-left dark:text-white">
                Blood Type
              </Label>
              <Controller
                name="bloodType"
                control={control}
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="bloodType"
                      className="bg-white dark:bg-gray-800 dark:text-white"
                    >
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-white">
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

            <div className="grid gap-2">
              <Label htmlFor="weight" className="text-left dark:text-white">
                Weight
              </Label>
              <Input
                {...register("weight")}
                id="weight"
                type="number"
                placeholder="Enter weight (kg)"
                className="bg-white dark:bg-gray-800 dark:text-white"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Medical History, Allergies, Notes */}
          <div className="grid gap-2">
            <Label
              htmlFor="medicalHistory"
              className="text-left dark:text-white"
            >
              Medical History
            </Label>
            <Textarea
              {...register("medicalHistory")}
              id="medicalHistory"
              placeholder="Enter medical history"
              className="bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          <Label htmlFor="allergies" className="text-left dark:text-white">
            Allergies
          </Label>
          <Textarea
            {...register("allergies")}
            placeholder="Enter allergies"
            className="bg-white dark:bg-gray-800 dark:text-white"
          />

          <Label htmlFor="notes" className="text-left dark:text-white">
            Notes
          </Label>
          <Textarea
            {...register("notes")}
            placeholder="Any additional notes."
            className="bg-white dark:bg-gray-800 dark:text-white"
          />
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            size="lg"
            type="submit"
            className="bg-primary hover:bg-primary/80 text-white"
          >
            Save
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
