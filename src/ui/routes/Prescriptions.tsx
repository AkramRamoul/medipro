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
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const prescriptions = await getData();
      setData(prescriptions);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  console.log("Prescriptions data:", data);
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

  return (
    <>
      <div className="flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-md max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Input
            placeholder="Filter by first or last name..."
            className="w-[80%]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="px-4">
          {isLoading ? (
            <p className="text-center text-gray-500">
              Loading prescriptions...
            </p>
          ) : (
            <Table>
              <TableCaption className="mt-6 text-gray-600">
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
                {filteredData.length > 0 ? (
                  filteredData.map((prescription) => (
                    <TableRow
                      key={prescription.id}
                      onClick={() => setSelectedPrescription(prescription)}
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
        </div>
      </div>
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
