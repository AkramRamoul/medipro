import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Overview } from "./Overview";
import { RecentSales } from "./recent-sales";
import { DashboardStats } from "../type";
import { Activity, Users, Calendar, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    consultationsThisMonth: 0,
    consultationsToday: 0,
    prescriptionsThisMonth: 0,
    totalPatients: 0,
    recentConsultations: [],
    consultationsLastMonth: 0,
    patientsThisMonth: 0,
    patientsLastMonth: 0,
  });

  const fetchDashboardStats = async () => {
    try {
      const data = await window.electronAPI.getDashboardStats();
      setStats({
        ...data,
        recentConsultations: data.recentConsultations.map((consultation) => ({
          ...consultation,
        })),
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const thisMonthPatients = stats.patientsThisMonth;
  const lastMonthPatients = stats.patientsLastMonth;

  const hasComparison = lastMonthPatients > 0;

  const percentChange = hasComparison
    ? ((thisMonthPatients - lastMonthPatients) / lastMonthPatients) * 100
    : 0;

  const isPositive = percentChange >= 0;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background md:flex text-foreground">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Activity className="w-8 h-8 text-primary" /> Tableau de bord
              </h2>
              <p className="text-muted-foreground mt-1">
                Vue d'ensemble de l'activité de la clinique.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Patients This Month Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nouveaux Patients (Mois)
                </CardTitle>
                <div className="bg-green-100 p-2 rounded-full dark:bg-green-900/30">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.patientsThisMonth}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {hasComparison ? (
                    <>
                      <TrendingUp
                        className={`w-3 h-3 ${
                          isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      {isPositive ? "+" : ""}
                      {percentChange.toFixed(1)}% par rapport au mois dernier
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      Aucune donnée pour le mois précédent
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Total Patients Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </CardTitle>
                <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalPatients}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enregistrés dans la base de données
                </p>
              </CardContent>
            </Card>

            {/* Prescriptions This Month Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ordonnances (Mois)
                </CardTitle>
                <div className="bg-purple-100 p-2 rounded-full dark:bg-purple-900/30">
                  <svg
                    className="h-4 w-4 text-purple-600 dark:text-purple-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="3" width="12" height="4" rx="1" />
                    <rect x="5" y="7" width="14" height="14" rx="2" />
                    <path d="M10 12h4" />
                    <path d="M10 16h4" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.prescriptionsThisMonth}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Délivrées ce mois-ci
                </p>
              </CardContent>
            </Card>

            {/* Consultations Today Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Consultations (Jour)
                </CardTitle>
                <div className="bg-orange-100 p-2 rounded-full dark:bg-orange-900/30">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.consultationsToday}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Effectuées aujourd'hui
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overview and Recent Consultations */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-start">
            {/* Overview Card */}
            <Card className="col-span-4 shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  Aperçu Annuel
                </CardTitle>
                <CardDescription>
                  Fluctuation du nombre de patients par mois.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>

            {/* Recent Consultations Card */}
            <Card className="col-span-3 bg-card border-none ring-1 ring-border/50 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  Consultations récentes
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vous avez effectué{" "}
                  <span className="font-semibold text-primary">
                    {stats.consultationsThisMonth}
                  </span>{" "}
                  consultations ce mois-ci.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales patients={stats.recentConsultations} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
