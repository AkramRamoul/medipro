import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

export type Patient = {
  id: string;
  firstname: string;
  lastname: string;
  contact: string;
  lastVisit: string | null;
  status?: string;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "lastname",
    header: ({ column }) => (
      <Button
        className="text-left ml-[-1rem]"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.getValue("lastname")}</span>,
    sortingFn: (rowA, rowB) =>
      (rowA.getValue("lastname") as string).localeCompare(
        rowB.getValue("lastname") as string,
      ),
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => (
      <Button
        className="text-left"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.getValue("firstname")}</span>,
    sortingFn: (rowA, rowB) =>
      (rowA.getValue("firstname") as string).localeCompare(
        rowB.getValue("firstname") as string,
      ),
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "lastVisit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-end w-full"
      >
        Last visit
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rawDate: string | null = row.getValue("lastVisit");

      if (!rawDate) {
        return (
          <div className="text-right font-medium pr-3 text-muted-foreground">
            <em className="text-muted-foreground">Jamais visité</em>
          </div>
        );
      }

      const date = new Date(rawDate);
      const formattedDate = isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

      return <div className="text-right font-medium pr-3">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue("lastVisit") || "").getTime();
      const dateB = new Date(rowB.getValue("lastVisit") || "").getTime();

      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;

      return dateA - dateB;
    },
  },
];
