import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface BusiestDaysProps {
    data: { day: string; count: number }[];
}

export function BusiestDays({ data }: BusiestDaysProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Jours les plus chargés</CardTitle>
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
        <Card className="shadow-lg rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Jours les plus chargés</CardTitle>
                <CardDescription>Distribution des consultations par jour (3 derniers mois)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorBusiest" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                fontSize={11}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                dy={10}
                            />
                            <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid #10b98144',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#colorBusiest)"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
