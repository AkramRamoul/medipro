"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
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
import { PlusIcon } from "lucide-react";
import { Patient } from "../../type";

const bloodWorkSchema = z.object({
  patientName: z.string().min(2),
  date: z.string(),
  results: z.array(z.string().min(1)), // now ARRAY
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
      patientName: `${patient.last_name} ${patient.first_name}`, // or patient.name depending on your type
      date: new Date().toISOString().split("T")[0],
      results: [],
    },
  });

  // local state for adding items
  const [currentItem, setCurrentItem] = useState("");

  function addItem() {
    if (!currentItem.trim()) return;
    const updated = [...form.getValues("results"), currentItem.trim()];
    form.setValue("results", updated);
    setCurrentItem("");
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Blood Work Request</CardTitle>
        <CardDescription>Create a new blood work record.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date + Type */}

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* RESULTS LIST instead of textarea */}
            <div className="space-y-3">
              <label className="font-medium">Tests / Items</label>

              {/* Input + add button */}
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Type here..."
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={addItem}
                  className="w-10 h-10 p-0"
                >
                  <PlusIcon className="text-xl font-bold" />
                </Button>
              </div>

              {/* Items box */}
              <div className="border rounded-xl p-4 space-y-2">
                {form.watch("results").length === 0 ? (
                  <p className="text-muted-foreground">No items added yet.</p>
                ) : (
                  form.watch("results").map((item, index) => (
                    <div key={index} className="text-lg">
                      - {item}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Blood Work</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
