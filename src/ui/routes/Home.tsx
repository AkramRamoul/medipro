import { type Patient } from "../components/Home/colums";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PatientsTable from "../components/Patients/Table";

async function getData(): Promise<Patient[]> {
  try {
    const result = await window.electronAPI.getallpatients();
    return result;
  } catch (error) {
    console.error("Failed to fetch patients in component:", error);
    return [];
  }
}

interface HomeProps {
  showAll?: boolean;
}

export function Home({ showAll = false }: HomeProps) {
  const [data, setData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const patients = await getData();
      setData(patients);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const getName = async () => {
      const result = await window.electronAPI.getName();
      setName(result.name);
    };
    getName();
  }, [data]);

  const handlePatientArchived = (
    id: string,
    status: "active" | "archived" | "deleted",
  ) => {
    if (status === "deleted") {
      setData((prev) => prev.filter((p) => p.id !== id));
    } else {
      setData((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    }
  };

  const filteredData = showAll ? data : data.filter((p) => p.lastVisit !== null);

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-4 p-4 md:p-6 flex bg-background text-foreground transition-colors">
        <div className="flex items-center justify-between space-y-2">
          <div className=" flex-col">
            <h2 className="text-2xl font-bold tracking-tight">
              Bienvenu(e)
            </h2>
            <p className="text-muted-foreground">
              {showAll
                ? "Voici la liste de tous vos patients."
                : "Voici la liste des patients ayant effectué une consultation."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
          </div>
        ) : (
          <PatientsTable
            patients={filteredData}
            onPatientArchived={handlePatientArchived}
            disableDateFilter={showAll}
          />
        )}
      </div>
    </>
  );
}

export default Home;
