import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface CommonDiagnosesProps {
    data: { diagnosis: string; count: number }[];
}

export function CommonDiagnoses({ data }: CommonDiagnosesProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Diagnostics les plus fréquents</CardTitle>
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
        <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Diagnostics les plus fréquents</CardTitle>
                <CardDescription>Top 5 des diagnostics (3 derniers mois)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="colorDiag" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="diagnosis"
                                width={120}
                                axisLine={false}
                                tickLine={false}
                                fontSize={11}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid #10b98144',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#colorDiag)"
                                radius={[0, 4, 4, 0]}
                                barSize={16}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
