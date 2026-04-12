import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, filter: "blur(5px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

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
      <div className="min-h-screen flex flex-col bg-background/50 md:flex text-foreground relative overflow-hidden">
        {/* Subtle dynamic background for "Wow" factor */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-3xl -z-10 pointer-events-none" />

        <div className="flex-1 space-y-8 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl shadow-sm border border-primary/10">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                Tableau de bord
              </h2>
              <p className="text-muted-foreground mt-2">
                Vue d'ensemble de l'activité de la clinique.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2 shadow-sm rounded-lg active:scale-95 transition-all bg-card/80 backdrop-blur-md border-border/50 hover:bg-card hover:shadow-md", isLoading && "opacity-50 pointer-events-none")}
              onClick={fetchDashboardStats}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Refraîchir
            </Button>
          </div>

          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
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
                  color: "text-emerald-500",
                  bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
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
                  color: "text-indigo-500",
                  bg: "bg-gradient-to-br from-indigo-500/20 to-indigo-500/5",
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
                  color: "text-cyan-500",
                  bg: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5",
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
                  color: "text-rose-500",
                  bg: "bg-gradient-to-br from-rose-500/20 to-rose-500/5",
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
                  bg: "bg-gradient-to-br from-primary/20 to-primary/5",
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
                  color: "text-orange-500",
                  bg: "bg-gradient-to-br from-orange-500/20 to-orange-500/5",
                  subtext: "Planning quotidien",
                  showIcon: false
                },
                {
                  title: "Revenus (Année)",
                  value: `${(stats.earningsYear || 0).toLocaleString()} DA`,
                  icon: DollarSign,
                  color: "text-blue-500",
                  bg: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
                  subtext: "Total annuel cumulé",
                  showIcon: false
                },
                {
                  title: "Dépenses (Année)",
                  value: `${(stats.expensesYear || 0).toLocaleString()} DA`,
                  icon: Wallet,
                  color: "text-red-500",
                  bg: "bg-gradient-to-br from-red-500/20 to-red-500/5",
                  subtext: "Total annuel cumulé",
                  showIcon: false
                }
              ];

              return cards.map((card, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className={cn(
                    "relative overflow-hidden shadow-sm rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-md bg-card/60",
                    card.isPrimary ? "border-primary/30 shadow-primary/5" : "border-border/40 shadow-black/5"
                  )}>
                    {card.isPrimary && (
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    )}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                      <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", card.isPrimary ? "text-primary" : "text-muted-foreground")}>
                        {card.title}
                      </CardTitle>
                      <div className={cn("p-2.5 rounded-xl border border-white/10 shadow-sm", card.bg)}>
                        <card.icon className={cn("h-4 w-4 drop-shadow-sm", card.color)} />
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-24 rounded-md" />
                          <Skeleton className="h-3 w-16 rounded-sm" />
                        </div>
                      ) : (
                        <>
                          <div className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
                            {card.value}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            {card.showIcon && card.subtext && !card.isPrimary && (
                              card.isPositive 
                                ? <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500"><ArrowUpRight className="w-3 h-3" /></div>
                                : <div className="p-0.5 rounded-full bg-rose-500/10 text-rose-500"><ArrowDownRight className="w-3 h-3" /></div>
                            )}
                            <p className={cn(
                              "text-xs font-medium",
                              card.isPrimary ? "text-primary/80" : "text-muted-foreground"
                            )}>
                              {card.subtext}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ));
            })()}
          </motion.div>

          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-7 items-start relative z-10"
          >
            <motion.div variants={itemVariants} className="xl:col-span-4 rounded-2xl">
              <Card className="h-full shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Performance Financière</CardTitle>
                      <CardDescription>Revenus, dépenses et bénéfices mensuels.</CardDescription>
                    </div>
                    <div className="text-right px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Profit Net (Année)</div>
                      <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 drop-shadow-sm">
                        {((stats.earningsYear || 0) - (stats.expensesYear || 0)).toLocaleString()} DA
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                  ) : (
                    <FinancialOverview />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="xl:col-span-3 rounded-2xl">
              <Card className="h-full shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Répartition des Dépenses</CardTitle>
                  <CardDescription>Aperçu catégoriel du mois actuel.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full max-w-[250px] rounded-full" />
                    </div>
                  ) : (
                    <ExpenseBreakdown />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-start relative z-10"
          >
            <motion.div variants={itemVariants} className="lg:col-span-4 rounded-2xl">
              <Card className="h-full shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
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
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-3 rounded-2xl">
              <Card className="h-full shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
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
            </motion.div>
          </motion.div>

          {/* Bottom row metrics */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-6 items-start relative z-10 pb-10"
          >
            <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
              <PatientRetention
                retentionRate={stats.retentionRate}
                totalReturnPatients={stats.totalReturnPatients}
                totalUniquePatients={stats.totalUniquePatients}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
              <PatientDemographics
                genderData={stats.genderDistribution || []}
                ageData={stats.ageDistribution || []}
                totalPatients={stats.totalUniquePatients}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-3 h-full">
              <CommonDiagnoses data={stats.commonDiagnoses} />
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-3 h-full">
              <BusiestDays data={stats.busiestDays} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
