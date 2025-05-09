import { useState } from "react";
import { Patient } from "../Home/colums";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ArrowUpDown, Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import Pagination from "../Pagination";
import { Button } from "../ui/button";
import NewPatientModal from "../NewPatient/NewPatientModal";
import { useNavigate } from "react-router-dom";

function PatientsTable({ patients }: { patients: Patient[] }) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<
    "firstname" | "lastname" | "lastVisit" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const itemsPerPage = 8;
  const filteredData = patients
    .filter((patient) => {
      const first = patient.firstname?.toLowerCase() || "";
      const last = patient.lastname?.toLowerCase() || "";
      const full1 = `${first} ${last}`;
      const full2 = `${last} ${first}`;
      const q = query.trim().toLowerCase();

      return (
        first.includes(q) ||
        last.includes(q) ||
        full1.includes(q) ||
        full2.includes(q)
      );
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Handle nulls
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle string comparison
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle date comparison
      if (sortKey === "lastVisit") {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      return 0;
    });
  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Important: Reset to page 1 when query changes!
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1); // ⬅️ reset page!
  };
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <NewPatientModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex flex-col p-2 sm:p-4 border rounded-2xl bg-card text-card-foreground shadow-lg w-full max-w-[900px] mx-auto">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center mb-4 gap-2">
          <div className="relative w-full max-w-md ">
            <Input
              placeholder="Filtrer par prénom ou nom..."
              className="pl-10 py-3 rounded-lg border border-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              value={query}
              onChange={handleQueryChange}
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="w-5 h-5" />
            </span>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-fit flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <span>Ajouter un nouveau patient</span>
            <Plus className="w-4 h-4 font-bold" />
          </Button>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px] w-full">
            <TableCaption className="mt-6 text-muted-foreground">
              Une liste de tous vos patients
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-muted rounded-lg">
                <TableHead
                  className="text-muted-foreground text-left cursor-pointer select-none"
                  onClick={() => handleSort("firstname")}
                >
                  <span className="flex items-center">
                    Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                  </span>
                </TableHead>

                <TableHead
                  className="text-muted-foreground text-left cursor-pointer select-none"
                  onClick={() => handleSort("lastname")}
                >
                  <span className="flex items-center">
                    Prénom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </span>
                </TableHead>

                <TableHead className="text-muted-foreground">Contact</TableHead>

                <TableHead
                  className="text-muted-foreground text-right cursor-pointer select-none w-[200px]"
                  onClick={() => handleSort("lastVisit")}
                >
                  <span className="flex items-center justify-end">
                    Dernière visite
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => navigate(`/pat/${patient.id}`)}
                  >
                    <TableCell className="font-semibold">
                      {patient.firstname || "N/A"}
                    </TableCell>
                    <TableCell>{patient.lastname || "N/A"}</TableCell>
                    <TableCell>{patient.contact || "N/A"}</TableCell>
                    <TableCell className="text-right w-[200px]">
                      {patient.lastVisit === null
                        ? "N/A"
                        : new Date(patient.lastVisit).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    Aucun patient correspondant trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientsTable;
