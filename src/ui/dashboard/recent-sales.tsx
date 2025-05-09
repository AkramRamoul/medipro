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
    <div className="space-y-4">
      {patients.length > 0 ? (
        patients.map((patient, index) => {
          const fullName = `${patient.firstName} ${patient.lastName}`;

          return (
            <div
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-4 rounded-md cursor-pointer group transition-colors"
              key={index}
              onClick={() => navigate(`/pat/${patient.id}`)}
            >
              <Avatar>
                <AvatarFallback className="group-hover:bg-gray-300 dark:group-hover:bg-gray-700">
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="ml-4 space-y-1 text-black dark:text-gray-200">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font truncate flex items-center">
                  <strong className="text-gray-800 dark:text-gray-300">
                    Raison de visite:&nbsp;
                  </strong>
                  <span className="truncate text-sm inline-block max-w-[150px]">
                    {patient.reason}
                  </span>
                </p>
                <div className="ml-auto text-xs text-muted-foreground dark:text-gray-500">
                  {new Date(patient.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Aucune consultation récente.
        </p>
      )}
    </div>
  );
}
