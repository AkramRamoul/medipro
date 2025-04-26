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

function Page() {
  const [data, setData] = useState<ConsultationWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
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
  const [isConsOpen, setIsConsOpen] = useState(false);
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
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1); // ⬅️ reset page!
  };
  return (
    <>
      <div className="flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-md max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Input
            placeholder="Filter by first or last name..."
            className="w-[80%]"
            value={query}
            onChange={handleQueryChange}
          />
        </div>
        <div className="px-4">
          {isLoading ? (
            <p className="text-center text-gray-500">
              Loading prescriptions...
            </p>
          ) : (
            <Table>
              <TableCaption className="mt-6 text-gray-600 mb-3">
                A list of your recent prescriptions.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((prescription) => (
                    <TableRow
                      key={prescription.id}
                      onClick={() => {
                        setIsConsOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">
                        {prescription.patient?.first_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {prescription.patient?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(prescription.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </TableCell>
                      <Modal
                        isOpen={isConsOpen}
                        onClose={() => setIsConsOpen(false)}
                      >
                        <SingleConsultation
                          id={prescription.id.toString()}
                          onClose={() => {
                            setIsConsOpen(false);
                            fetchConsultations();
                          }}
                        />
                      </Modal>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-400"
                    >
                      No matching prescriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredData.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}

export default Page;
