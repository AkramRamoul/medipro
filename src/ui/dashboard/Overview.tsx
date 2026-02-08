import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { monthlyPatients } from "../type";

async function getData(): Promise<monthlyPatients[]> {
  try {
    const result = await window.electronAPI.getMonthlyPatients();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch patients in component:", error);
    return [];
  }
}

export function Overview() {
  const [data, setData] = useState<monthlyPatients[]>();

  useEffect(() => {
    const fetchData = async () => {
      const monthlyPatients = await getData();
      setData(monthlyPatients);
    };

    fetchData();
  }, []);
  console.log(data);
  return (
    <div className="w-[90vh]">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Mois",
              position: "bottom",
              offset: 10,
              style: { fill: "#555", fontWeight: "bold" },
            }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            label={{
              value: "Nombre de patients",
              angle: -90,
              position: "outsideLeft",
              offset: 20,
              style: { fill: "#555", fontWeight: "bold" },
            }}
          />

          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground text-center mt-2">
        Nombre mensuel de patients enregistrés à la clinique
      </p>
    </div>
  );
}
