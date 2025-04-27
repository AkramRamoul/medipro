import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";

export function RecentSales({
  patients,
}: {
  patients: {
    id: number;
    firstName: string;
    lastName: string;
    reason: string;
    diagnosis: string;
    date: string;
  }[];
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {patients.length > 0 ? (
        patients.map((patient, index) => {
          const fullName = `${patient.firstName} ${patient.lastName}`;

          return (
            <div
              className="flex items-center hover:bg-gray-100 p-4 rounded-md cursor-pointer group"
              key={index}
              onClick={() => navigate(`/pat/${patient.id}`)}
            >
              <Avatar>
                <AvatarFallback className="group-hover:bg-gray-300">
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-sm text-gray-600 font truncate flex items-center">
                  <strong className="text-gray-800">Raison de visite: </strong>
                  {"  "}
                  <span className="truncate text-sm inline-block max-w-[150px]">
                    {patient.reason}
                  </span>
                </p>
                <div className="ml-auto text-xs text-muted-foreground">
                  {new Date(patient.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground">
          No recent consultations.
        </p>
      )}
    </div>
  );
}
