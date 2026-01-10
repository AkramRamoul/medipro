import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { PrescriptionWithPatient } from "../type";
import Modal from "../components/Modal";
import SinglePrescription from "../components/Prescription/SinglePrescription";
import Pagination from "../components/Pagination";
import { Loader2, Search, Pill, Calendar, User, FileText } from "lucide-react";
import DropDown from "./comps/DropDownPrescription";
import { Button } from "../components/ui/button";
import GenericPrescriptionModal from "../components/Prescription/GenericPrescriptionModal";
import { Plus } from "lucide-react";
import ModalV2 from "../components/Modalsecond";
import { Card, CardHeader, CardTitle } from "../components/ui/card";

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
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const prescriptions = await getData();
    setData(prescriptions);
    setIsLoading(false);
  };

  useEffect(() => {
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

  console.log("📢 filteredData:", filteredData);
  return (
    <div className="max-w-[80%] mx-auto space-y-6 mt-8">
      {/* Header Card */}
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Pill className="w-5 h-5" />
              Dossier des Ordonnances
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez toutes les ordonnances délivrées.
            </p>
          </div>
          <Button
            onClick={() => setIsNewPrescriptionOpen(true)}
            className="ml-4 gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nouvelle Ordonnance
          </Button>
        </CardHeader>
      </Card>

      <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
          <div className="relative w-full max-w-md">
            <Input
              placeholder="Filtrer par Nom ou Prénom..."
              className="pl-10 h-10 rounded-lg border-input bg-background"
              value={query}
              onChange={handleQueryChange}
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-2">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[30%]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" /> Nom
                    </div>
                  </TableHead>
                  <TableHead className="w-[30%]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" /> Prénom
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Options
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((prescription) => (
                    <TableRow
                      key={prescription.id}
                      onClick={() => setSelectedPrescription(prescription)}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-semibold">
                        {prescription.patient?.first_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {prescription.patient?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex justify-end items-center h-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropDown
                            prescription={prescription}
                            setData={setData}
                            patient={prescription.patient!}
                            medications={prescription.medications}
                            isPsychotropic={prescription.isPsychotropic}
                            psychotropicNumber={prescription.psychotropicNumber}
                            patientAddress={prescription.patientAddress}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 opacity-20" />
                        <p>Aucune ordonnance correspondante trouvée.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="p-4 border-t">
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
            isPsychotropic={selectedPrescription.isPsychotropic}
            psychotropicNumber={selectedPrescription.psychotropicNumber}
            patientAddress={selectedPrescription.patientAddress}
          />
        )}
      </Modal>

      {/* New Prescription Modal */}
      <ModalV2
        isOpen={isNewPrescriptionOpen}
        onClose={() => setIsNewPrescriptionOpen(false)}
      >
        <div className="p-6 ">
          <GenericPrescriptionModal
            onClose={() => setIsNewPrescriptionOpen(false)}
            refreshPrescriptions={fetchData}
          />
        </div>
      </ModalV2>
    </div>
  );
}

export default Prescriptions;
