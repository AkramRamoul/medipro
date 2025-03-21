import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

// This type is used to define the shape of our data.
export type Patient = {
  id: string;
  name: string;
  contact: string;
  date: string; // Ensure date is in a valid format like "YYYY-MM-DD"
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="text-left ml-[-1rem]"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-end w-full"
        >
          Last visit
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rawDate: string = row.getValue("date");
      const date = new Date(rawDate);
      const formattedDate = date.toLocaleDateString("en-GB");
      return <div className="text-right font-medium pr-3">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue("date")).getTime();
      const dateB = new Date(rowB.getValue("date")).getTime();
      return dateA - dateB;
    },
  },
];
