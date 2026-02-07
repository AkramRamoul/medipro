import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, Users } from "lucide-react";

interface PatientRetentionProps {
    retentionRate: number;
    totalReturnPatients: number;
    totalUniquePatients: number;
}

export function PatientRetention({
    retentionRate,
    totalReturnPatients,
    totalUniquePatients
}: PatientRetentionProps) {
    const getRetentionColor = (rate: number) => {
        if (rate >= 70) return "text-green-600 dark:text-green-400";
        if (rate >= 50) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getRetentionBgColor = (rate: number) => {
        if (rate >= 70) return "bg-green-100 dark:bg-green-900/30";
        if (rate >= 50) return "bg-yellow-100 dark:bg-yellow-900/30";
        return "bg-red-100 dark:bg-red-900/30";
    };

    return (
        <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taux de fidélisation
                </CardTitle>
                <div className={`p-2 rounded-full ${getRetentionBgColor(retentionRate)}`}>
                    <TrendingUp className={`h-4 w-4 ${getRetentionColor(retentionRate)}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-4xl font-bold ${getRetentionColor(retentionRate)}`}>
                    {retentionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    6 derniers mois
                </p>
                <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{totalReturnPatients}</span>
                            {" "}patients fidèles sur{" "}
                            <span className="font-semibold text-foreground">{totalUniquePatients}</span>
                        </span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                    Patients ayant consulté plus d'une fois
                </p>
            </CardContent>
        </Card>
    );
}
