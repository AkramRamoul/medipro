import { type Patient } from "../components/Home/colums";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PatientsTable from "../components/Patients/Table";
import api from "../axios";

async function getData(): Promise<Patient[]> {
    try {
        const result = await api.get("/patients");
        return result.data;
    } catch (error) {
        console.error("Failed to fetch patients in component:", error);
        return [];
    }
}

export function Patients() {
    const [data, setData] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const patients = await getData();
            setData(patients);
            setIsLoading(false);
        };

        fetchData();
    }, []);

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

    return (
        <div className="h-full flex-1 flex-col space-y-4 p-4 md:p-6 flex bg-background text-foreground transition-colors">
            <div className="flex items-center justify-between space-y-2">
                <div className=" flex-col">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Tous les Patients
                    </h2>
                    <p className="text-muted-foreground">
                        Voici la liste de tous vos patients enregistrés.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
                </div>
            ) : (
                <PatientsTable
                    patients={data}
                    onPatientArchived={handlePatientArchived}
                    disableDateFilter={true}
                />
            )}
        </div>
    );
}

export default Patients;
