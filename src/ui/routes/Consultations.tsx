import { useCallback, useEffect, useState } from "react";
import { ConsultationWithPatient } from "../type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import SingleConsultation from "../components/Consultation/SingleConsultation";
import Pagination from "../components/Pagination";
import {
  Loader2,
  Search,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Activity,
} from "lucide-react";
import DeleteDialogue from "../components/DeleteDialogue";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import ModalV2 from "../components/Modalsecond";

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
    <div className="max-w-[80%] mx-auto space-y-6 mt-8">
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Stethoscope className="w-5 h-5" />
              Dossier de Consultations
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 pb-2">
              Historique complet des consultations.
            </p>
          </div>
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

        {/* Table */}
        <div className="p-2">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" /> Patient
                    </div>
                  </TableHead>
                  <TableHead className="w-[130px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Motif de consultation
                    </div>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Diagnostic
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((consultation) => (
                    <TableRow
                      key={consultation.id}
                      onClick={() => {
                        setSelectedPrescriptionId(consultation.id.toString());
                      }}
                      className=" hover:bg-white/[0.04] odd:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <TableCell className="font-semibold">
                        {consultation.patient?.first_name || "N/A"}{" "}
                        {consultation.patient?.last_name || ""}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {new Date(consultation.date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2">
                          {consultation.reason || (
                            <span className="text-muted-foreground italic text-sm">
                              Non spécifié
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-1">
                          {consultation.diagnosis ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {consultation.diagnosis}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">
                              Non spécifié
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px]">
                        <div
                          className="flex justify-center items-center h-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DeleteDialogue
                            consultationId={consultation.id.toString()}
                            setData={setData}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Stethoscope className="w-8 h-8 opacity-20" />
                        <p>Aucune consultation correspondante trouvée.</p>
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

      {/* Modal */}
      {selectedPrescriptionId && (
        <ModalV2
          isOpen
          onClose={() => setSelectedPrescriptionId(null)}
          panelClassName="sm:max-w-4xl"
        >
          <SingleConsultation
            id={selectedPrescriptionId}
            onClose={() => {
              setSelectedPrescriptionId(null);
              fetchConsultations();
            }}
          />
        </ModalV2>
      )}
    </div>
  );
}

export default Page;
