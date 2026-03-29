import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Users } from "lucide-react";

interface PatientDemographicsProps {
  genderData: { gender: string; count: number }[];
  ageData: { ageGroup: string; count: number }[];
  totalPatients: number;
}

const GENDER_COLORS = ['#10b981', '#14b8a6', '#94a3b8'];

export function PatientDemographics({ genderData, ageData, totalPatients }: PatientDemographicsProps) {
  return (
    <Card className="shadow-sm rounded-xl bg-card border-none ring-1 ring-border/50 col-span-full lg:col-span-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Démographie des Patients</CardTitle>
            <CardDescription>Répartition par sexe et groupes d'âge</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          
          {/* Gender Pie Chart */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Répartition par Sexe</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="gender"
                    stroke="none"
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #10b98144', 
                      backgroundColor: 'hsl(var(--card))',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground text-center italic">
              Total de {totalPatients} patients uniques
            </p>
          </div>

          {/* Age Bar Chart */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Groupes d'Âge</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="ageGroup" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #10b98144', 
                      backgroundColor: 'hsl(var(--card))',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Bar dataKey="count" fill="url(#colorAge)" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
