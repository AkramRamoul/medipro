import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface CommonDiagnosesProps {
    data: { diagnosis: string; count: number }[];
}

export function CommonDiagnoses({ data }: CommonDiagnosesProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground">Diagnostics les plus fréquents</CardTitle>
                    <CardDescription>Top 5 des diagnostics (3 derniers mois)</CardDescription>
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
                <CardTitle className="text-xl text-foreground">Diagnostics les plus fréquents</CardTitle>
                <CardDescription>Top 5 des diagnostics (3 derniers mois)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis
                            type="category"
                            dataKey="diagnosis"
                            width={150}
                            tick={{ fontSize: 12 }}
                        />
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
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
