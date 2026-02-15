import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { initialsAvatar } from "../lib/utils";

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
        patients.map((patient) => {
          const fullName = `${patient.firstName} ${patient.lastName}`;
          const initials =
            `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase();
          return (
            <div
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-4 rounded-md cursor-pointer group transition-colors"
              key={patient.id}
              onClick={() => navigate(`/pat/${patient.id}`)}
            >
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={initialsAvatar(initials)} alt={initials} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="ml-4 space-y-1 text-black dark:text-gray-200">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font truncate flex items-center">
                  <strong className="text-gray-800 dark:text-gray-300">
                    Diagnostic:&nbsp;
                  </strong>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {patient.diagnosis}
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
