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
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import api from "../axios";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, User, ShieldCheck, UserCircle, Stethoscope, Activity, HeartPulse } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { initialsAvatar } from "../lib/utils";
import { Card, CardContent } from "../components/ui/card";

const schema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

type FormValues = z.infer<typeof schema>;

interface Account {
  id: number;
  email: string;
  role: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await api.get("/auth/accounts");
        setAccounts(response.data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setAccountsLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  // Secret shortcut to show admin (Alt + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || "Identifiants invalides";
      form.setError("password", { message });
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAccount = (email: string) => {
    setSelectedEmail(email);
    form.setValue("email", email);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="h-4 w-4 text-primary" />;
      case 'doctor': return <UserCircle className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'doctor': return 'Docteur';
      case 'receptionist': return 'Réceptionniste';
      default: return role;
    }
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
            <h2 className="text-3xl font-bold tracking-tight">DocManager</h2>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight">
              L'excellence au service de votre <span className="text-blue-400">pratique médicale</span>.
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              Simplifiez votre quotidien, optimisez vos consultations et offrez le meilleur des soins à vos patients.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Stethoscope className="h-6 w-6 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold">Consultations</h4>
                <p className="text-sm text-slate-400">Suivi précis et complet.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <HeartPulse className="h-6 w-6 text-teal-400 mt-0.5" />
              <div>
                <h4 className="font-semibold">Patients</h4>
                <p className="text-sm text-slate-400">Gestion fluide du dossier.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-500 font-medium italic">
            &copy; {new Date().getFullYear()} DocManager. Propulsé par l'innovation médicale.
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
              <h2 className="text-xl font-bold">DocManager</h2>
            </div>
          </div>

          {!selectedEmail && accounts.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Bienvenue</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                  Veuillez choisir votre profil pour accéder à la plateforme.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {accounts.map((account) => {
                  const initials = account.email.substring(0, 2).toUpperCase();
                  return (
                    <Card
                      key={account.id}
                      className="group relative cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-card border-slate-200 dark:border-slate-800"
                      onClick={() => handleSelectAccount(account.email)}
                    >
                      <CardContent className="p-6 flex flex-col items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 ring-4 ring-transparent group-hover:ring-primary/20 transition-all duration-300 shadow-sm">
                            <AvatarImage src={initialsAvatar(initials)} alt={account.email} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800">
                            {getRoleIcon(account.role)}
                          </div>
                        </div>
                        <div className="text-center w-full">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {account.email.split('@')[0]}
                          </p>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {getRoleLabel(account.role)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {showAdmin && (
                  <Card
                    className="group relative cursor-pointer hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-card border-red-100 dark:border-red-950/30 animate-in zoom-in-95"
                    onClick={() => handleSelectAccount("admin@clinic.com")}
                  >
                    <CardContent className="p-6 flex flex-col items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-4 ring-transparent group-hover:ring-red-500/20 transition-all duration-300 shadow-sm">
                          <AvatarImage src={initialsAvatar("AD")} alt="Admin" />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800">
                          <ShieldCheck className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                      <div className="text-center w-full">
                        <p className="font-bold text-red-600 dark:text-red-400">Administrateur</p>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accès Système</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card
                  className="group cursor-pointer hover:border-slate-400 transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700"
                  onClick={() => setSelectedEmail("")}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full min-h-[160px]">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <User className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="font-bold text-slate-600 dark:text-slate-400 tracking-tight">
                      Autre compte
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-8 fade-in-0 duration-700">
              <div className="mb-10 flex flex-col gap-4">
                {(selectedEmail || accounts.length > 0) && (
                  <Button
                    variant="ghost"
                    className="w-fit p-0 hover:bg-transparent text-primary hover:text-primary/80 font-bold transition-colors mb-2"
                    onClick={() => setSelectedEmail(null)}
                    type="button"
                  >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Retour au choix du compte
                  </Button>
                )}
                <div className="space-y-1">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Connexion</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                    {selectedEmail ? `Ravi de vous revoir !` : "Content de vous revoir parmi nous."}
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {!selectedEmail && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-slate-900 dark:text-slate-200 font-bold">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="nom@exemple.com"
                              className="h-12 border-slate-200 dark:border-slate-800 focus:ring-primary rounded-xl"
                              {...field}
                            />
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
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-900 dark:text-slate-200 font-bold">Mot de passe</FormLabel>
                          {selectedEmail && <span className="text-sm font-medium text-slate-500">{selectedEmail}</span>}
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
                        Chargement...
                      </>
                    ) : "Se connecter"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
