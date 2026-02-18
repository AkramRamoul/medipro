import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import api from "../../axios";

const fieldSchema = z.object({
  label: z.string().min(1, "Le libellé est requis"),
  type: z.enum(["text", "textarea", "number", "date"]),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface CustomField {
  id: number;
  name: string;
  label: string;
  type: string;
}

const ConsultationFieldsSettings: React.FC = () => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      type: "text",
    },
  });

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const { data: result } = await api.get('/consultations/settings/custom-fields');
      setFields(result);
    } catch (error) {
      toast.error("Erreur lors du chargement des champs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const onSubmit = async (values: FieldFormValues) => {
    try {
      const name = values.label.toLowerCase().replace(/\s+/g, "_");
      const { data: result } = await api.post('/consultations/settings/custom-fields', {
        ...values,
        name,
      });
      if (result.success) {
        toast.success("Champ ajouté avec succès");
        form.reset();
        fetchFields();
      } else {
        toast.error("Erreur lors de l'ajout du champ");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { data: result } = await api.delete(`/consultations/settings/custom-fields/${id}`);
      if (result.success) {
        toast.success("Champ supprimé");
        fetchFields();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <div className="space-y-6 m-8 p-6 bg-card text-foreground border border-border rounded-lg shadow-sm text-left">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          Champs personnalisés de consultation
        </h3>
        <p className="text-sm text-muted-foreground">
          Ajoutez des champs supplémentaires qui apparaîtront dans le formulaire
          de consultation.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <FormField
            control={form.control}
            name="label"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Libellé du champ</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Température" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">Texte court</SelectItem>
                    <SelectItem value="textarea">Texte long</SelectItem>
                    <SelectItem value="number">Nombre</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full text-white">
            <Plus className="mr-2 h-4 w-4" /> Ajouter
          </Button>
        </form>
      </Form>

      <div className="mt-8">
        <h4 className="text-sm font-semibold mb-4">Champs existants</h4>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : fields.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Aucun champ personnalisé configuré.
          </p>
        ) : (
          <div className="divide-y divide-border border rounded-md">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{field.label}</p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {field.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationFieldsSettings;
