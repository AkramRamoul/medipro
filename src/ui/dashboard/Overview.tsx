import { useCallback, useEffect, useState } from "react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip
} from "recharts";
import api from "../axios";
import { Loader2 } from "lucide-react";

export function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, monthlyRes] = await Promise.all([
        api.get("/consultations/stats"),
        api.get("/consultations/monthly-patients")
      ]);
      setStats(statsRes.data);
      setMonthlyData(monthlyRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !stats) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            fontSize={12} 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            fontSize={12} 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #10b98144', 
              backgroundColor: 'hsl(var(--card))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar 
            dataKey="total" 
            fill="url(#colorMonthly)" 
            radius={[6, 6, 0, 0]} 
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
