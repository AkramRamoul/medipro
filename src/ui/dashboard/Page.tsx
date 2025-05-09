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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    consultationsThisMonth: 0,
    consultationsToday: 0,
    prescriptionsThisMonth: 0,
    activePatients: 0,
    recentConsultations: [],
  });

  const fetchDashboardStats = async () => {
    try {
      const data = await window.electronAPI.getDashboardStats();
      setStats({
        ...data,
        recentConsultations: data.recentConsultations.map(
          (consultation, index) => ({
            id: index + 1, // Assign a unique ID
            ...consultation,
          })
        ),
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const estimatedRevenue = stats.consultationsThisMonth * 1500;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background md:flex text-foreground">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Tableau de bord
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Estimated Revenue Card */}
            <Card className="shadow-sm rounded-xl bg-card border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Revenu estimé
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary pt-2">
                  {estimatedRevenue.toLocaleString()} DA
                </div>
              </CardContent>
            </Card>

            {/* Active Patients Card */}
            <Card className="shadow-sm rounded-xl bg-card border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Patients actifs{" "}
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary pt-2">
                  {stats.activePatients}
                </div>
              </CardContent>
            </Card>

            {/* Prescriptions This Month Card */}
            <Card className="shadow-sm rounded-xl bg-card border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Ordonnances ce mois-ci{" "}
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
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
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary pt-2">
                  {stats.prescriptionsThisMonth}
                </div>
              </CardContent>
            </Card>

            {/* Consultations Today Card */}
            <Card className="shadow-sm rounded-xl bg-card border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  Consultations aujourd'hui{" "}
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary pt-2">
                  {stats.consultationsToday}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overview and Recent Consultations */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 items-start">
            {/* Overview Card */}
            <Card className="col-span-4 shadow-sm rounded-xl bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Aperçu </CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>

            {/* Recent Consultations Card */}
            <Card className="col-span-3 bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  Recent Consultations
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vous avez effectué {stats.consultationsThisMonth}{" "}
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
