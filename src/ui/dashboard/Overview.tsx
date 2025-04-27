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
      console.log("Fetched data:", monthlyPatients);
    };

    fetchData();
  }, []);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
