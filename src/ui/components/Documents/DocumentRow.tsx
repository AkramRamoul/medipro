import { TableRow, TableCell } from "../ui/table";
import { format } from "date-fns";
import { Document, Patient } from "../../type";
import DocsDropDown from "./DocsDropdown";

interface DocumentRowProps {
  document: Document;
  setData: React.Dispatch<React.SetStateAction<Document[]>>;
  patinet: Patient;
}

// Helper function to convert UTC to UTC+1
const convertToUTCPlus1 = (utcDate: string): Date => {
  const date = new Date(utcDate);
  // Add 1 hour (3600000 milliseconds) to convert UTC to UTC+1
  return new Date(date.getTime() + 3600000);
};

export default function DocumentRow({
  document,
  setData,
  patinet,
}: DocumentRowProps) {
  const labels = {
    blood: "Demande Bilan",
    certificate: "Certificat médical",
    report: "Rapport médical",
  } as const;
  return (
    <TableRow>
      <TableCell className="w-[35%] font-medium text-left">
        {document.createdAt
          ? new Date(document.createdAt).toLocaleDateString("fr-FR")
          : "Invalid Date"}
      </TableCell>
      <TableCell className="text-left capitalize w-[35%]">
        {labels[document.type]}
      </TableCell>
      <TableCell className="hidden md:table-cell text-left text-muted-foreground">
        {document.createdAt
          ? format(convertToUTCPlus1(document.createdAt), "hh:mm a")
          : "N/A"}
      </TableCell>
      <TableCell className="text-right">
        <DocsDropDown patinet={patinet} document={document} setData={setData} />
      </TableCell>
    </TableRow>
  );
}
