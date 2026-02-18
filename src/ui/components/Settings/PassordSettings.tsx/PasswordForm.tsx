import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { usePasswordStatus } from "../../../hooks/usePasswordStatus";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import api from "../../../axios";

const createSchema = z
  .object({
    password: z
      .string()
      .min(6, "Le mot de passe doit comporter au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

const updateSchema = z
  .object({
    oldPassword: z.string().min(1, "Le mot de passe actuel est requis."),
    password: z
      .string()
      .min(6, "Le nouveau mot de passe doit comporter au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export function PasswordForm() {
  const status = usePasswordStatus();
  const schema = status.status === "exists" ? updateSchema : createSchema;

  type CreatePasswordFormValues = z.infer<typeof createSchema>;
  type UpdatePasswordFormValues = z.infer<typeof updateSchema>;
  type PasswordFormValues = CreatePasswordFormValues | UpdatePasswordFormValues;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConsfirmPassword, setShowConfirmPassword] = useState(false);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [removePasswordValue, setRemovePasswordValue] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemovePassword = async () => {
    setIsRemoving(true);
    try {
      const result =
        await api.post("/users/remove-password", { password: removePasswordValue });

      if (result.data.success) {
        toast.success("Mot de passe supprimé avec succès");
        setIsRemoveOpen(false);
        setRemovePasswordValue("");
        await status.refetch();
      } else {
        toast.error(result.data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur technique");
    } finally {
      setIsRemoving(false);
    }
  };

  async function onSubmit(data: PasswordFormValues) {
    setSubmitting(true);
    try {
      if (status.status === "not-exists") {
        await api.post("/users/create-password", { password: data.password });
        toast.success("Mot de passe créé avec succès");
        form.reset({
          password: "",
          confirmPassword: "",
        });
        await status.refetch();
      } else {
        const success = await api.post("/users/change-password", {
          oldPassword: (data as UpdatePasswordFormValues).oldPassword,
          password: data.password,
        });

        if (success.data.success) {
          toast.success("Mot de passe mis à jour avec succès");
          form.reset({
            oldPassword: "",
            password: "",
            confirmPassword: "",
          });
        } else {
          toast.error("Le mot de passe actuel est incorrect");
        }
      }
    } catch (err) {
      toast.error(` Erreur lors de la mise à jour du mot de passe: ${err}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (status.status === "loading") return null;

  return (
    <div className="space-y-6 m-8 p-6 bg-card text-foreground border border-border rounded-lg shadow-sm flex items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col m-8 space-y-8 w-full max-w-xl"
        >
          <h2 className="text-xl font-bold text-center text-foreground">
            {status.status === "not-exists"
              ? "Créer un mot de passe"
              : "Mettre à jour le mot de passe"}
          </h2>

          {status.status === "exists" && (
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem className="space-y-2 text-left">
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Entrez le mot de passe actuel"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showOldPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2 text-left">
                <FormLabel>Nouveau mot de passe</FormLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormDescription>
                  Utilisez au moins 6 caractères.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2 text-left">
                <FormLabel>Confirmez le mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConsfirmPassword ? "text" : "password"}
                      placeholder="Répéter le nouveau mot de passe"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showConsfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex flex-col gap-4">
            <Button type="submit" disabled={submitting}>
              {status.status === "not-exists"
                ? "Créer un mot de passe"
                : "Mettre à jour le mot de passe"}
            </Button>

            {status.status === "exists" && (
              <Button
                className=""
                type="button"
                variant="destructive"
                onClick={() => setIsRemoveOpen(true)}
              >
                Supprimer le mot de passe
              </Button>
            )}
          </div>
        </form>
      </Form>

      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le mot de passe</DialogTitle>
            <DialogDescription>
              Veuillez entrer votre mot de passe actuel pour confirmer la
              suppression. Cette action désactivera la protection par mot de
              passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Mot de passe actuel"
              value={removePasswordValue}
              onChange={(e) => setRemovePasswordValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveOpen(false)}>
              Annuler
            </Button>
            <Button
              className=""
              variant="destructive"
              onClick={handleRemovePassword}
              disabled={isRemoving || !removePasswordValue}
            >
              {isRemoving ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
