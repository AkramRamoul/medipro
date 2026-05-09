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
import api from "../axios";
import { useState } from "react";
import { Loader2, Activity, HeartPulse, Lock } from "lucide-react";

const schema = z.object({
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

type FormValues = z.infer<typeof schema>;

interface LoginPageProps {
  onUnlock?: () => void;
}

export default function LoginPage({ onUnlock }: LoginPageProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const response = await api.post("/users/verify-password", data);
      if (response.data.success) {
        if (onUnlock) onUnlock();
      } else {
        form.setError("password", { message: "Mot de passe incorrect" });
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || "Erreur de connexion";
      form.setError("password", { message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden font-sans">
      {/* Hero Section (Left Pane) */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 text-white relative bg-primary overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-teal-500 rounded-full blur-[100px] animate-pulse delay-700" />

          {/* Abstract SVG Pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">MediPro</h2>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight">
              L'excellence au service de votre <span className="text-blue-400">pratique médicale</span>.
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              Système verrouillé. Veuillez entrer votre mot de passe pour continuer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Lock className="h-6 w-6 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold">Sécurité</h4>
                <p className="text-sm text-slate-400">Vos données sont protégées.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <HeartPulse className="h-6 w-6 text-teal-400 mt-0.5" />
              <div>
                <h4 className="font-semibold">Confidentialité</h4>
                <p className="text-sm text-slate-400">Accès restreint.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-500 font-medium italic">
            &copy; {new Date().getFullYear()} MediPro. Propulsé par l'innovation médicale.
          </p>
        </div>
      </div>

      {/* Login Section (Right Pane) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50 dark:bg-slate-950 shadow-2xl z-20 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">MediPro</h2>
            </div>
          </div>

          <div className="animate-in slide-in-from-bottom-8 fade-in-0 duration-700">
            <div className="mb-10 flex flex-col gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Déverrouillage</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                  Veuillez entrer votre mot de passe pour accéder à MediPro.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-900 dark:text-slate-200 font-bold">Mot de passe</FormLabel>
                      </div>
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

                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Vérification...
                    </>
                  ) : "Déverrouiller"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
