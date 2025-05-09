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

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(30, { message: "Name must not be longer than 30 characters." }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

function SettingsForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: AccountFormValues) {
    const success = await window.electronAPI.createName(data.name);

    if (success.success) {
      toast.success("Nom mis à jour avec succès");
      form.reset({
        name: "",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8 rounded-lg bg-background p-8 "
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2 text-left">
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre name" {...field} className="w-full" />
              </FormControl>
              <FormDescription>
                C'est le nom qui sera affiché sur l'écran d'accueil .
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4">
          <Button type="submit" className="px-6">
            Mettre à jour Votre nom
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SettingsForm;
