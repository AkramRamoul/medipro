import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import api from "../axios";
import { useState, useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  newPassword: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ForceResetScreen() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const response = await api.post("/auth/force-reset", {
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        toast.success("Mot de passe mis à jour avec succès");
        login(response.data.token, response.data.user);
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  // Guard: redirect away if the user doesn't actually need a password reset
  useEffect(() => {
    if (!user || !user.requiresPasswordChange) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user || !user.requiresPasswordChange) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex flex-col items-center text-center gap-3">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sécurité du compte</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Pour des raisons de sécurité, vous devez configurer un nouveau mot de passe avant d'accéder à l'application.
            </p>
          </div>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-bold">Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 border-slate-200 dark:border-slate-800 focus:ring-primary rounded-xl"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-bold">Confirmez le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 border-slate-200 dark:border-slate-800 focus:ring-primary rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mise à jour...
                  </>
                ) : "Enregistrer et continuer"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
