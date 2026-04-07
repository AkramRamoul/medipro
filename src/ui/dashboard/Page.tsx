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
import { PatientDemographics } from "./PatientDemographics";
import { FinancialOverview } from "./FinancialOverview";
import { ExpenseBreakdown } from "./ExpenseBreakdown";
import { DashboardStats } from "../type";
import { Activity, Users, Calendar, TrendingUp, DollarSign, Wallet, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../axios";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";

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
    earningsYear: 0,
    expensesYear: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/consultations/stats");
      setStats((prev) => ({
        ...prev,
        ...data,
        recentConsultations: (data.recentConsultations || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (consultation: any) => ({
            ...consultation,
          }),
        ),
      }));
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2 shadow-sm rounded-lg active:scale-95 transition-all", isLoading && "opacity-50 pointer-events-none")}
              onClick={fetchDashboardStats}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Rafraîchir
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(() => {
              const getPercentChange = (current: number, previous: number) => {
                if (!previous || previous === 0) return { val: 0, exists: false };
                const pct = ((current - previous) / previous) * 100;
                return { val: pct, exists: true, isPos: pct >= 0 };
              };

              const cards = [
                {
                  title: "Patients (Mois)",
                  value: stats.patientsThisMonth,
                  icon: Users,
                  color: "text-green-600 dark:text-green-400",
                  bg: "bg-green-100 dark:bg-green-900/30",
                  subtext: isLoading ? null : getPercentChange(stats.patientsThisMonth, stats.patientsLastMonth).exists
                    ? `${getPercentChange(stats.patientsThisMonth, stats.patientsLastMonth).val.toFixed(1)}% vs mois dernier`
                    : "pas de données du mois dernier",
                  isPositive: getPercentChange(stats.patientsThisMonth, stats.patientsLastMonth).isPos,
                  showIcon: true,
                },
                {
                  title: "Consultations (Mois)",
                  value: stats.consultationsThisMonth,
                  icon: Activity,
                  color: "text-purple-600 dark:text-purple-400",
                  bg: "bg-purple-100 dark:bg-purple-900/30",
                  subtext: isLoading ? null : getPercentChange(stats.consultationsThisMonth, stats.consultationsLastMonth).exists
                    ? `${getPercentChange(stats.consultationsThisMonth, stats.consultationsLastMonth).val.toFixed(1)}% vs mois dernier`
                    : "Effectuées ce mois",
                  isPositive: getPercentChange(stats.consultationsThisMonth, stats.consultationsLastMonth).isPos,
                  showIcon: true,
                },
                {
                  title: "Revenus (Mois)",
                  value: `${(stats.earningsThisMonth || 0).toLocaleString()} DA`,
                  icon: DollarSign,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-100 dark:bg-emerald-900/30",
                  subtext: isLoading ? null : getPercentChange(stats.earningsThisMonth, stats.earningsLastMonth).exists
                    ? `${getPercentChange(stats.earningsThisMonth, stats.earningsLastMonth).val.toFixed(1)}% vs mois dernier`
                    : `${(stats.earningsToday || 0).toLocaleString()} DA aujourd'hui`,
                  isPositive: getPercentChange(stats.earningsThisMonth, stats.earningsLastMonth).isPos,
                  showIcon: true
                },
                {
                  title: "Dépenses (Mois)",
                  value: `${(stats.expensesThisMonth || 0).toLocaleString()} DA`,
                  icon: Wallet,
                  color: "text-red-600 dark:text-red-400",
                  bg: "bg-red-100 dark:bg-red-900/30",
                  subtext: isLoading ? null : getPercentChange(stats.expensesThisMonth, stats.expensesLastMonth).exists
                    ? `${getPercentChange(stats.expensesThisMonth, stats.expensesLastMonth).val.toFixed(1)}% vs mois dernier`
                    : `${(stats.expensesToday || 0).toLocaleString()} DA aujourd'hui`,
                  isPositive: !getPercentChange(stats.expensesThisMonth, stats.expensesLastMonth).isPos,
                  showIcon: true
                },
                {
                  title: "Profit Net (Mois)",
                  value: `${((stats.earningsThisMonth || 0) - (stats.expensesThisMonth || 0)).toLocaleString()} DA`,
                  icon: TrendingUp,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  isPrimary: true,
                  subtext: isLoading ? null : stats.earningsThisMonth > 0
                    ? `Marge: ${(((stats.earningsThisMonth - stats.expensesThisMonth) / stats.earningsThisMonth) * 100).toFixed(0)}%`
                    : "Net bénéfice",
                  showIcon: true
                },
                {
                  title: "Rendez-vous (Auj)",
                  value: stats.appointmentsToday,
                  icon: Calendar,
                  color: "text-orange-600 dark:text-orange-400",
                  bg: "bg-orange-100 dark:bg-orange-900/30",
                  subtext: "Planning quotidien",
                  showIcon: false
                },
                {
                  title: "Revenus (Année)",
                  value: `${(stats.earningsYear || 0).toLocaleString()} DA`,
                  icon: DollarSign,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-100 dark:bg-blue-900/30",
                  subtext: "Total annuel cumulé",
                  showIcon: false
                },
                {
                  title: "Dépenses (Année)",
                  value: `${(stats.expensesYear || 0).toLocaleString()} DA`,
                  icon: Wallet,
                  color: "text-rose-600 dark:text-rose-400",
                  bg: "bg-rose-100 dark:bg-rose-900/30",
                  subtext: "Total annuel cumulé",
                  showIcon: false
                }
              ];

              return cards.map((card, idx) => (
                <Card key={idx} className={cn(
                  "shadow-sm rounded-xl border-none ring-1 transition-all duration-300 hover:shadow-md hover:ring-primary/20",
                  card.isPrimary ? "bg-primary/5 ring-primary/30" : "bg-card ring-border/50"
                )}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", card.isPrimary ? "text-primary" : "text-muted-foreground")}>
                      {card.title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-lg", card.bg)}>
                      <card.icon className={cn("h-4 w-4", card.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                          {card.value}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {card.showIcon && card.subtext && !card.isPrimary && (
                            card.isPositive ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />
                          )}
                          <p className={cn(
                            "text-[10px] font-medium",
                            card.isPrimary ? "text-primary" : "text-muted-foreground"
                          )}>
                            {card.subtext}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ));
            })()}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-start">
            <Card className="col-span-4 shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">Performance Financière</CardTitle>
                    <CardDescription>Revenus, dépenses et bénéfices mensuels.</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground">Profit Net (Année)</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {((stats.earningsYear || 0) - (stats.expensesYear || 0)).toLocaleString()} DA
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <FinancialOverview />
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3 shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Répartition des Dépenses</CardTitle>
                <CardDescription>Aperçu catégoriel du mois actuel.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full rounded-full max-w-[250px]" />
                  </div>
                ) : (
                  <ExpenseBreakdown />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-start">
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

          <div className="grid gap-8 lg:grid-cols-6 items-start">
            <div className="lg:col-span-2">
              <PatientRetention
                retentionRate={stats.retentionRate}
                totalReturnPatients={stats.totalReturnPatients}
                totalUniquePatients={stats.totalUniquePatients}
              />
            </div>

            <div className="lg:col-span-4">
              <PatientDemographics
                genderData={stats.genderDistribution || []}
                ageData={stats.ageDistribution || []}
                totalPatients={stats.totalUniquePatients}
              />
            </div>

            <div className="lg:col-span-3">
              <CommonDiagnoses data={stats.commonDiagnoses} />
            </div>

            <div className="lg:col-span-3">
              <BusiestDays data={stats.busiestDays} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
