import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
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
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useLocation } from "react-router-dom";

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
  const [newPrescriptionStep, setNewPrescriptionStep] = useState<1 | 2>(1);

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

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const location = useLocation();
  useEffect(() => {
    const state = location.state as { openNewPrescription?: boolean } | null;

    if (state?.openNewPrescription) {
      setIsNewPrescriptionOpen(true);
      setNewPrescriptionStep(1);
    }
  }, [location.state]);

  return (
    <div className="max-w-[80%] mx-auto space-y-6 mt-8">
      {/* Header Card */}
      <Card className="border border-white/5 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Pill className="w-5 h-5" />
              Dossier des Ordonnances
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 pb-2">
              Gérez toutes les ordonnances délivrées.
            </p>
          </div>
          <Button
            onClick={() => setIsNewPrescriptionOpen(true)}
            className="ml-4 gap-2 hover:shadow-lg hover:shadow-primary/20 transition"
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
              className="pl-10 h-11 text-base rounded-xl border-input bg-background focus:ring-2 focus:ring-primary/30"
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
              <TableHeader className="bg-muted/60 border-b border-white/10 backdrop-blur">
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
                      className=" hover:bg-white/[0.04] odd:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <TableCell className="font-semibold">
                        {prescription.patient?.first_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {prescription.patient?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString(
                            "fr-FR",
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex justify-end items-center h-full opacity-60 hover:opacity-100 transition"
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
          <div className="p-4 border-t bg-muted/20">
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
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
            isPsychotropic={selectedPrescription.isPsychotropic}
            psychotropicNumber={selectedPrescription.psychotropicNumber}
            patientAddress={selectedPrescription.patientAddress}
            prescriptionDate={selectedPrescription.date}
          />
        )}
      </Modal>

      {/* New Prescription Modal */}
      <Dialog
        open={isNewPrescriptionOpen}
        onOpenChange={(open) => {
          setIsNewPrescriptionOpen(open);

          if (!open) {
            setNewPrescriptionStep(1);
          }
        }}
      >
        <DialogContent
          className={cn(
            "p-0 transition-all duration-300",
            newPrescriptionStep === 1 ? "sm:max-w-xl" : "sm:max-w-6xl",
          )}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Nouvelle Ordonnance</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            <GenericPrescriptionModal
              onClose={() => setIsNewPrescriptionOpen(false)}
              refreshPrescriptions={fetchData}
              onStepChange={setNewPrescriptionStep}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Prescriptions;
