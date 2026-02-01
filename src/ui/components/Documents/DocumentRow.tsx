import { TableRow, TableCell } from "../ui/table";
import { format } from "date-fns";
import { Document, Patient } from "../../type";
import DocsDropdown from "./DocsDropdown";

interface DocumentRowProps {
  document: Document;
  setData: React.Dispatch<React.SetStateAction<Document[]>>;
  patinet: Patient;
  onView?: (document: Document) => void;
}

const convertToUTCPlus1 = (utcDate: string): Date => {
  const date = new Date(utcDate);
  return new Date(date.getTime() + 3600000);
};

export default function DocumentRow({
  document,
  setData,
  patinet,
  onView,
}: DocumentRowProps) {
  const labels: Record<string, string> = {
    blood: "Demande Bilan",
    certificate: "Certificat médical",
    report: "Rapport médical",
    template: "Lettre / Autre",
  };
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onView?.(document)}
    >
      <TableCell className="w-[35%] font-medium text-left">
        {document.createdAt
          ? new Date(document.createdAt).toLocaleDateString("fr-FR")
          : "Invalid Date"}
      </TableCell>
      <TableCell className="text-left capitalize w-[35%]">
        {document.name || labels[document.type]}
      </TableCell>
      <TableCell className="hidden md:table-cell text-left text-muted-foreground">
        {document.createdAt
          ? format(convertToUTCPlus1(document.createdAt), "hh:mm a")
          : "N/A"}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DocsDropdown patinet={patinet} document={document} setData={setData} />
      </TableCell>
    </TableRow>
  );
}
