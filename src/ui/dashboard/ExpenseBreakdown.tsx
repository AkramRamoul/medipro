import { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import api from "../axios";
import { Loader2 } from "lucide-react";
import { ExpenseBreakdown as ExpenseBreakdownType } from "../type";


const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'supplies': 'Fournitures',
  'rent': 'Loyer',
  'utilities': 'Factures',
  'maintenance': 'Entretien',
  'marketing': 'Marketing',
  'insurance': 'Assurance',
  'staff': 'Personnel',
  'other': 'Autre'
};

const translateCategory = (category: string) => 
  CATEGORY_TRANSLATIONS[category.toLowerCase()] || category;

export function ExpenseBreakdown() {
  const [data, setData] = useState<ExpenseBreakdownType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/consultations/expense-breakdown");
      setData(data);
    } catch (error) {
      console.error("Failed to fetch expense breakdown:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalExpense = data.reduce((sum, item) => sum + item.total, 0);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune dépense enregistrée ce mois-ci.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="expGrad0" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="expGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="expGrad3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="expGrad4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={5}
            dataKey="total"
            nameKey="category"
            stroke="none"
            animationBegin={0}
            animationDuration={1500}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={`url(#expGrad${index % 5})`} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} DA`,
              translateCategory(name)
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => <span className="text-xs font-medium text-muted-foreground">{translateCategory(value)}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Label */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pb-8">
        <span className="text-lg font-bold text-foreground leading-none">
          {totalExpense.toLocaleString()}
        </span>
        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
          DA Total
        </span>
      </div>
    </div>
  );
}

