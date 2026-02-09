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
import { CommonDiagnoses } from "./CommonDiagnoses";
import { BusiestDays } from "./BusiestDays";
import { PatientRetention } from "./PatientRetention";
import { DashboardStats } from "../type";
import { Activity, Users, Calendar, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    consultationsThisMonth: 0,
    consultationsToday: 0,
    prescriptionsThisMonth: 0,
    totalPatients: 0,
    appointmentsToday: 0,
    recentConsultations: [],
    consultationsLastMonth: 0,
    patientsThisMonth: 0,
    patientsLastMonth: 0,
    commonDiagnoses: [],
    busiestDays: [],
    retentionRate: 0,
    totalReturnPatients: 0,
    totalUniquePatients: 0,
    earningsThisMonth: 0,
    earningsToday: 0,
    earningsLastMonth: 0,
    expensesThisMonth: 0,
    expensesToday: 0,
    expensesLastMonth: 0,
  });

  const fetchDashboardStats = async () => {
    try {
      const data = await window.electronAPI.getDashboardStats();
      setStats({
        ...data,
        recentConsultations: data.recentConsultations.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (consultation: any) => ({
            ...consultation,
          }),
        ),
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
                  Patients ce mois
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
                        className={`w-3 h-3 ${isPositive ? "text-green-500" : "text-red-500"
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

            {/* Prescriptions This Month Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Consultations (Mois)
                </CardTitle>
                <div className="bg-purple-100 p-2 rounded-full dark:bg-purple-900/30">
                  <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.consultationsThisMonth}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Effectuées ce mois-ci
                </p>
              </CardContent>
            </Card>

            {/* Earnings This Month Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenus (Mois)
                </CardTitle>
                <div className="bg-emerald-100 p-2 rounded-full dark:bg-emerald-900/30">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {(stats.earningsThisMonth || 0).toLocaleString()} DA
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.earningsToday || 0).toLocaleString()} DA aujourd'hui
                </p>
              </CardContent>
            </Card>

            {/* Expenses This Month Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Dépenses (Mois)
                </CardTitle>
                <div className="bg-red-100 p-2 rounded-full dark:bg-red-900/30">
                  <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400 rotate-180" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {(stats.expensesThisMonth || 0).toLocaleString()} DA
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.expensesToday || 0).toLocaleString()} DA aujourd'hui
                </p>
              </CardContent>
            </Card>

            {/* Net Profit Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Profit Net (Mois)
                </CardTitle>
                <div className="bg-primary/20 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {((stats.earningsThisMonth || 0) - (stats.expensesThisMonth || 0)).toLocaleString()} DA
                </div>
                <p className="text-xs text-primary/70 mt-1">
                  Revenus - Dépenses
                </p>
              </CardContent>
            </Card>

            {/* Consultations Today Card */}
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rendez-vous aujourd’hui
                </CardTitle>
                <div className="bg-orange-100 p-2 rounded-full dark:bg-orange-900/30">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.appointmentsToday}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prévus pour aujourd'hui
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

          {/* Advanced Analytics Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Patient Retention Card */}
            <PatientRetention
              retentionRate={stats.retentionRate}
              totalReturnPatients={stats.totalReturnPatients}
              totalUniquePatients={stats.totalUniquePatients}
            />

            {/* Common Diagnoses Card */}
            <div className="md:col-span-2 lg:col-span-2">
              <CommonDiagnoses data={stats.commonDiagnoses} />
            </div>

            {/* Busiest Days Card */}
            <div className="md:col-span-2 lg:col-span-3">
              <BusiestDays data={stats.busiestDays} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
