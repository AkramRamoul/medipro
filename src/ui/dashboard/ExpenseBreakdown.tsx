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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'supplies': 'Fournitures',
  'rent': 'Loyer / Factures',
  'staff': 'Personnel',
  'other': 'Autre'
};

const translateCategory = (category: string) => CATEGORY_TRANSLATIONS[category] || category;

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
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
            nameKey="category"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid hsl(var(--border))', 
              backgroundColor: 'hsl(var(--card))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} DA`, 
              translateCategory(name)
            ]}
          />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle" 
            formatter={(value: string) => translateCategory(value)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

