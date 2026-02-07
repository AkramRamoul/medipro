import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface BusiestDaysProps {
    data: { day: string; count: number }[];
}

export function BusiestDays({ data }: BusiestDaysProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground">Jours les plus chargés</CardTitle>
                    <CardDescription>Distribution des consultations par jour (3 derniers mois)</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune donnée disponible
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
            <CardHeader>
                <CardTitle className="text-xl text-foreground">Jours les plus chargés</CardTitle>
                <CardDescription>Distribution des consultations par jour (3 derniers mois)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="currentColor"
                            className="fill-primary"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
