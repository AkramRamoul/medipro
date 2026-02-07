import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { Activity, TrendingUp, Weight } from "lucide-react";
import { VitalSignsData } from "../../type";

interface VitalSignsChartProps {
    patientId: string;
}

export function VitalSignsChart({ patientId }: VitalSignsChartProps) {
    const [vitalsData, setVitalsData] = useState<VitalSignsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVitals = async () => {
            try {
                setLoading(true);
                const data = await window.electronAPI.getPatientVitals(Number(patientId));
                setVitalsData(data);
            } catch (error) {
                console.error("Failed to fetch vital signs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchVitals();
        }
    }, [patientId]);

    // Parse blood pressure data
    const bpData = vitalsData
        .filter((v) => v.bloodPressure && v.date)
        .map((v) => {
            const [systolic, diastolic] = v.bloodPressure!.split("/").map(Number);
            return {
                date: new Date(v.date!).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
                fullDate: new Date(v.date!).toLocaleDateString("fr-FR"),
                systolic: systolic || null,
                diastolic: diastolic || null,
            };
        });

    // Parse weight data
    const weightData = vitalsData
        .filter((v) => v.weight && v.date)
        .map((v) => ({
            date: new Date(v.date!).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
            fullDate: new Date(v.date!).toLocaleDateString("fr-FR"),
            weight: Number(v.weight) || null,
        }));

    // Parse glucose data
    const glucoseData = vitalsData
        .filter((v) => v.glucose && v.date)
        .map((v) => ({
            date: new Date(v.date!).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
            fullDate: new Date(v.date!).toLocaleDateString("fr-FR"),
            glucose: Number(v.glucose) || null,
        }));

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">{payload[0]?.payload?.fullDate || label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-medium">{entry.name}:</span> {entry.value} {entry.unit || ""}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Chargement des signes vitaux...</p>
                </div>
            </div>
        );
    }

    if (vitalsData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/50 p-6 rounded-full mb-4">
                    <Activity className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucune donnée disponible</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Les signes vitaux seront enregistrés lors des consultations et affichés ici pour suivre l'évolution du patient.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Blood Pressure Chart */}
            {bpData.length > 0 && (
                <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-card to-card/50 border-none ring-1 ring-border/50 overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-md">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-foreground">Tension Artérielle</CardTitle>
                                <CardDescription className="text-sm">Évolution de la pression systolique et diastolique</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={bpData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    domain={[60, 180]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: "Systolique élevée", fill: '#ef4444', fontSize: 11 }} />
                                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: "Diastolique élevée", fill: '#f59e0b', fontSize: 11 }} />
                                <Area type="monotone" dataKey="systolic" stroke="none" fill="url(#colorSystolic)" />
                                <Area type="monotone" dataKey="diastolic" stroke="none" fill="url(#colorDiastolic)" />
                                <Line
                                    type="monotone"
                                    dataKey="systolic"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    name="Systolique (mmHg)"
                                    dot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="diastolic"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    name="Diastolique (mmHg)"
                                    dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Weight Chart */}
            {weightData.length > 0 && (
                <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-card to-card/50 border-none ring-1 ring-border/50 overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-md">
                                <Weight className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-foreground">Poids</CardTitle>
                                <CardDescription className="text-sm">Évolution du poids corporel</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={weightData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fill="url(#colorWeight)"
                                    name="Poids (kg)"
                                    dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Glucose Chart */}
            {glucoseData.length > 0 && (
                <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-card to-card/50 border-none ring-1 ring-border/50 overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-xl shadow-md">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-foreground">Glycémie</CardTitle>
                                <CardDescription className="text-sm">Évolution du taux de glucose sanguin</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={glucoseData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    domain={[50, 200]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.6} label={{ value: "Normal", fill: '#10b981', fontSize: 11 }} />
                                <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.6} label={{ value: "Diabète", fill: '#ef4444', fontSize: 11 }} />
                                <Area type="monotone" dataKey="glucose" stroke="none" fill="url(#colorGlucose)" />
                                <Line
                                    type="monotone"
                                    dataKey="glucose"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    name="Glucose (mg/dL)"
                                    dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
