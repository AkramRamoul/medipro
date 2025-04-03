import { type Patient } from "../components/Home/colums";
import { columns } from "../components/Home/colums";
import { DataTable } from "../components/Home/Data-table";
import NewPatientModal from "../components/NewPatient/NewPatientModal";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
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
  const [isOpen, setIsOpen] = useState(false);
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
      <NewPatientModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="h-full flex-1 flex-col space-y-8 p-4 md:p-8 flex">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-3 flex-col">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your patients!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Button onClick={() => setIsOpen(true)} className="w-fit">
          Add New Patient
        </Button>

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
