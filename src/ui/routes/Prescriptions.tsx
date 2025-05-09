import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { PrescriptionWithPatient } from "../type";
import Modal from "../components/Modal";
import SinglePrescription from "../components/Prescription/SinglePrescription";
import Pagination from "../components/Pagination";
import { Loader2, Search } from "lucide-react";
import DropDown from "./comps/DropDownPrescription";

async function getData(): Promise<PrescriptionWithPatient[]> {
  try {
    return await window.electronAPI.getAllPrescriptions();
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    return [];
  }
}

function Prescriptions() {
  const [data, setData] = useState<PrescriptionWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionWithPatient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const prescriptions = await getData();
      setData(prescriptions);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const itemsPerPage = 8;
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

  // Important: Reset to page 1 when query changes!
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1); // ⬅️ reset page!
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-8 border rounded-2xl bg-card text-foreground border-border shadow-lg max-w-5xl mx-auto mt-10">
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <Input
              placeholder="Filter by first or last name..."
              className="pl-10 py-3 rounded-lg border border-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              value={query}
              onChange={handleQueryChange}
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 overflow-x-auto">
          {isLoading ? (
            <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
          ) : (
            <Table>
              <TableCaption className="mt-6 text-muted-foreground">
                Une liste de toutes vos ordonnances.{" "}
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-muted-foreground">Nom</TableHead>
                  <TableHead className="text-muted-foreground">
                    Prénom
                  </TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground w-[80px]">
                    <div className="flex justify-center items-center">
                      Supprimer
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((prescription) => (
                    <TableRow
                      key={prescription.id}
                      onClick={() => setSelectedPrescription(prescription)}
                      className="hover:bg-accent transition-colors cursor-pointer"
                    >
                      <TableCell className="font-semibold">
                        {prescription.patient?.first_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {prescription.patient?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center h-full">
                          <DropDown
                            prescription={prescription}
                            setData={setData}
                            patient={prescription.patient!}
                            medications={prescription.medications}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
                      Aucune ordonnance correspondante trouvée.
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
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      >
        {selectedPrescription && (
          <SinglePrescription
            meds={selectedPrescription.medications}
            onClose={() => setSelectedPrescription(null)}
            patient={selectedPrescription.patient!}
          />
        )}
      </Modal>
    </>
  );
}

export default Prescriptions;
