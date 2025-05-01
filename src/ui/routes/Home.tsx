import { type Patient } from "../components/Home/colums";
import { columns } from "../components/Home/colums";
import { DataTable } from "../components/Home/Data-table";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Fetch data from the main process
async function getData(): Promise<Patient[]> {
  try {
    const result = await window.electronAPI.getallpatients();
    return result;
  } catch (error) {
    console.error("Failed to fetch patients in component:", error);
    return [];
  }
}

export function Home() {
  const [data, setData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const patients = await getData();
      setData(patients);
      setIsLoading(false);
      console.log("Fetched patients:", patients);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-4 md:p-8 flex bg-background text-foreground transition-colors">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-3 flex-col">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your patients!
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </>
  );
}

export default Home;
