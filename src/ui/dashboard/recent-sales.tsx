import { Avatar, AvatarFallback } from "../components/ui/avatar";

export function RecentSales({
  patients,
}: {
  patients: {
    firstName: string;
    lastName: string;
    reason: string;
    diagnosis: string;
    date: string;
  }[];
}) {
  return (
    <div className="space-y-8">
      {patients.length > 0 ? (
        patients.map((patient, index) => {
          const fullName = `${patient.firstName} ${patient.lastName}`;

          return (
            <div className="flex items-center" key={index}>
              <Avatar>
                <AvatarFallback>
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.reason}
                </p>
              </div>

              <div className="ml-auto text-xs text-muted-foreground">
                {new Date(patient.date).toLocaleDateString()}
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
