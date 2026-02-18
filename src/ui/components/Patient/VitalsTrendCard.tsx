import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { VitalSignsData } from "../../type";
import { VITALS_CONFIG } from "../../lib/vitals-config";
import api from "../../axios";

interface VitalsTrendCardProps {
    patientId: string;
}

type TrendDirection = "up" | "down" | "stable";

function calculateTrend(data: number[]): TrendDirection {
    if (data.length < 2) return "stable";
    const recent = data.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const first = data[0];

    if (avg > first * 1.05) return "up";
    if (avg < first * 0.95) return "down";
    return "stable";
}

function TrendIcon({ direction, isGood }: { direction: TrendDirection; isGood?: boolean }) {
    const colorClass = isGood
        ? "text-green-500"
        : direction === "stable"
            ? "text-muted-foreground"
            : "text-red-500";

    if (direction === "up") return <TrendingUp className={`h-3.5 w-3.5 ${colorClass}`} />;
    if (direction === "down") return <TrendingDown className={`h-3.5 w-3.5 ${colorClass}`} />;
    return <Minus className={`h-3.5 w-3.5 ${colorClass}`} />;
}

interface MiniSparklineProps {
    data: { value: number }[];
    color: string;
    height?: number;
}

function MiniSparkline({ data, color, height = 40 }: MiniSparklineProps) {
    if (data.length < 2) return null;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

interface VitalMetricProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    unit: string;
    trend: TrendDirection;
    trendIsGood?: boolean;
    sparklineData: { value: number }[];
    sparklineColor: string;
    bgColor: string;
    iconBgColor: string;
}

function VitalMetric({
    icon,
    label,
    value,
    unit,
    trend,
    trendIsGood,
    sparklineData,
    sparklineColor,
    bgColor,
    iconBgColor,
}: VitalMetricProps) {
    return (
        <div className={`flex-1 p-4 rounded-xl ${bgColor} min-w-[160px]`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${iconBgColor}`}>
                        {icon}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <TrendIcon direction={trend} isGood={trendIsGood} />
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <span className="text-2xl font-bold text-foreground">{value}</span>
                    <span className="text-xs text-muted-foreground ml-1">{unit}</span>
                </div>
            </div>

            {sparklineData.length > 1 && (
                <div className="mt-2 -mx-1">
                    <MiniSparkline data={sparklineData} color={sparklineColor} height={35} />
                </div>
            )}
        </div>
    );
}

export function VitalsTrendCard({ patientId }: VitalsTrendCardProps) {
    const [vitalsData, setVitalsData] = useState<VitalSignsData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVitals = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/consultations/patient/${patientId}/vitals`);
            setVitalsData(data);
        } catch (error) {
            console.error("Failed to fetch vital signs:", error);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (patientId) {
            fetchVitals();
        }
    }, [fetchVitals, patientId]);

    useEffect(() => {
        const handleVitalsUpdated = (event: Event) => {
            const detail = (event as CustomEvent<{ patientId?: number }>).detail;
            if (!detail?.patientId || detail.patientId !== Number(patientId)) {
                return;
            }
            fetchVitals();
        };

        window.addEventListener("patient-vitals-updated", handleVitalsUpdated);
        return () => {
            window.removeEventListener("patient-vitals-updated", handleVitalsUpdated);
        };
    }, [fetchVitals, patientId]);

    // Sort by date descending to get latest first
    const sortedData = [...vitalsData].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Parse blood pressure data (systolic) - oldest to newest for sparkline
    const bpDataPoints = vitalsData
        .filter((v) => v.bloodPressure && v.date)
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .map((v) => {
            const [systolic] = v.bloodPressure!.split("/").map(Number);
            return systolic;
        })
        .filter((v) => !isNaN(v));

    const bpSparkline = bpDataPoints.map((v) => ({ value: v }));
    const latestBPEntry = sortedData.find((v) => v.bloodPressure);
    const latestBP = latestBPEntry?.bloodPressure || "--";
    const bpTrend = calculateTrend(bpDataPoints);
    const bpTrendIsGood = bpTrend === "down" || bpTrend === "stable";

    // Parse weight data - oldest to newest for sparkline
    const weightDataPoints = vitalsData
        .filter((v) => v.weight && v.date)
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .map((v) => Number(v.weight))
        .filter((v) => !isNaN(v));

    const weightSparkline = weightDataPoints.map((v) => ({ value: v }));
    const latestWeightEntry = sortedData.find((v) => v.weight);
    const latestWeight = latestWeightEntry?.weight || "--";
    const weightTrend = calculateTrend(weightDataPoints);

    // Parse glucose data - oldest to newest for sparkline
    const glucoseDataPoints = vitalsData
        .filter((v) => v.glucose && v.date)
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .map((v) => Number(v.glucose))
        .filter((v) => !isNaN(v));

    const glucoseSparkline = glucoseDataPoints.map((v) => ({ value: v }));
    const latestGlucoseEntry = sortedData.find((v) => v.glucose);
    const latestGlucose = latestGlucoseEntry?.glucose || "--";
    const glucoseTrend = calculateTrend(glucoseDataPoints);
    const glucoseTrendIsGood = glucoseTrend === "down" || glucoseTrend === "stable";

    const hasAnyData = bpDataPoints.length > 0 || weightDataPoints.length > 0 || glucoseDataPoints.length > 0;

    if (loading) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Chargement des tendances...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!hasAnyData) {
        return (
            <Card className="border-border/50 shadow-sm bg-muted/20">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Activity className="h-5 w-5" />
                        <div>
                            <p className="text-sm font-medium">Aucune donnée vitale</p>
                            <p className="text-xs">Les signes vitaux apparaîtront ici après les consultations.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Tendances Vitales</h3>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {vitalsData.length} mesure{vitalsData.length > 1 ? "s" : ""}
                    </span>
                </div>

                <div className="flex gap-3 flex-wrap">
                    {bpDataPoints.length > 0 && (() => {
                        const config = VITALS_CONFIG.bloodPressure;
                        const Icon = config.icon;
                        return (
                            <VitalMetric
                                icon={<Icon className={`h-3.5 w-3.5 ${config.tailwind.text}`} />}
                                label={config.labelShort}
                                value={latestBP as string}
                                unit={config.unit}
                                trend={bpTrend}
                                trendIsGood={bpTrendIsGood}
                                sparklineData={bpSparkline}
                                sparklineColor={config.color.primary}
                                bgColor={`${config.tailwind.bg} ${config.tailwind.bgDark}`}
                                iconBgColor={`${config.tailwind.iconBg} ${config.tailwind.iconBgDark}`}
                            />
                        );
                    })()}

                    {weightDataPoints.length > 0 && (() => {
                        const config = VITALS_CONFIG.weight;
                        const Icon = config.icon;
                        return (
                            <VitalMetric
                                icon={<Icon className={`h-3.5 w-3.5 ${config.tailwind.text}`} />}
                                label={config.labelShort}
                                value={latestWeight as string}
                                unit={config.unit}
                                trend={weightTrend}
                                sparklineData={weightSparkline}
                                sparklineColor={config.color.primary}
                                bgColor={`${config.tailwind.bg} ${config.tailwind.bgDark}`}
                                iconBgColor={`${config.tailwind.iconBg} ${config.tailwind.iconBgDark}`}
                            />
                        );
                    })()}

                    {glucoseDataPoints.length > 0 && (() => {
                        const config = VITALS_CONFIG.glucose;
                        const Icon = config.icon;
                        return (
                            <VitalMetric
                                icon={<Icon className={`h-3.5 w-3.5 ${config.tailwind.text}`} />}
                                label={config.labelShort}
                                value={latestGlucose as string}
                                unit={config.unit}
                                trend={glucoseTrend}
                                trendIsGood={glucoseTrendIsGood}
                                sparklineData={glucoseSparkline}
                                sparklineColor={config.color.primary}
                                bgColor={`${config.tailwind.bg} ${config.tailwind.bgDark}`}
                                iconBgColor={`${config.tailwind.iconBg} ${config.tailwind.iconBgDark}`}
                            />
                        );
                    })()}
                </div>
            </CardContent>
        </Card>
    );
}
