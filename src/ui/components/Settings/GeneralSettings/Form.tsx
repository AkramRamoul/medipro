// components/Settings/SettingsForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
    .max(30, { message: "Le nom ne doit pas dépasser 30 caractères." }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

function SettingsForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
  });

  // 🔄 Fetch name on mount and populate form
  useEffect(() => {
    const getName = async () => {
      try {
        const result = await window.electronAPI.getName();
        if (result?.name) {
          form.reset({ name: result.name });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Erreur lors du chargement du nom.");
      }
    };
    getName();
  }, [form]);

  async function onSubmit(data: AccountFormValues) {
    const trimmedName = data.name.trim();
    const success = await window.electronAPI.createName(trimmedName);

    if (success.success) {
      toast.success("Nom mis à jour avec succès");
      form.reset({ name: trimmedName });
    } else {
      toast.error("Une erreur est survenue lors de la mise à jour du nom.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8 rounded-lg bg-background p-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2 text-left">
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" {...field} className="w-full" />
              </FormControl>
              <FormDescription>
                C'est le nom qui sera affiché sur l'écran d'accueil.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4">
          <Button
            type="submit"
            className="px-6 text-white"
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
          >
            Mettre à jour votre nom
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SettingsForm;
