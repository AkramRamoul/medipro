import { useCallback, useEffect, useState } from "react";
import { ConsultationWithPatient } from "../type";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import Modal from "../components/Modal";
import SingleConsultation from "../components/Consultation/SingleConsultation";
import Pagination from "../components/Pagination";
import { Search } from "lucide-react";

function Page() {
  const [data, setData] = useState<ConsultationWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchConsultations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await window.electronAPI.getAllConsultations();
      setData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const filteredData = data.filter((prescription) => {
    const first = prescription.patient?.first_name?.toLowerCase() || "";
    const last = prescription.patient?.last_name?.toLowerCase() || "";
    const full1 = `${first} ${last}`;
    const full2 = `${last} ${first}`;
    const q = query.trim().toLowerCase();

    return (
      first.includes(q) ||
      last.includes(q) ||
      full1.includes(q) ||
      full2.includes(q)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-8 border rounded-2xl bg-card text-foreground border-border shadow-lg max-w-5xl mx-auto mt-10">
      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="w-5 h-5" />
          </span>
          <Input
            placeholder="Search by first or last name..."
            className="pl-10 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            value={query}
            onChange={handleQueryChange}
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-4 overflow-x-auto">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">
            Loading consultations...
          </p>
        ) : (
          <Table>
            <TableCaption className="mt-6 text-muted-foreground">
              A list of your recent prescriptions.
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-muted-foreground">
                  First Name
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Last Name
                </TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((prescription) => (
                  <TableRow
                    key={prescription.id}
                    onClick={() => {
                      setSelectedPrescriptionId(prescription.id.toString());
                    }}
                    className="hover:bg-muted transition-colors cursor-pointer"
                  >
                    <TableCell className="font-semibold text-foreground">
                      {prescription.patient?.first_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {prescription.patient?.last_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {new Date(prescription.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {new Date(prescription.date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Africa/Algiers",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    No matching prescriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

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

      {/* Modal */}
      {selectedPrescriptionId && (
        <Modal isOpen onClose={() => setSelectedPrescriptionId(null)}>
          <SingleConsultation
            id={selectedPrescriptionId}
            onClose={() => {
              setSelectedPrescriptionId(null);
              fetchConsultations();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default Page;
