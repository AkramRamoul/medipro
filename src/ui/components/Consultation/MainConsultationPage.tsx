import { useCallback, useEffect, useState } from "react";
import NewConsultationForm from "./NewConsultationForm";
import { Button } from "../ui/button";
import { Consultation } from "../../type";
import DeleteDialogue from "../DeleteDialogue";
import SingleConsultation from "./SingleConsultation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "../Pagination";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Stethoscope, Plus, Calendar, FileText, Activity } from "lucide-react";
import ModalV2 from "../Modalsecond";

function ConsultationForm({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(
    null,
  );

  // ✅ Memoized fetch function
  const fetchConsultations = useCallback(async () => {
    try {
      const data = await window.electronAPI.getConsultations(id);
      setConsultations(data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const itemsPerPage = 8;
  const totalItems = consultations.length;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [consultations]);

  return (
    <div className="space-y-6 max-w-[80%] mx-auto">
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Stethoscope className="w-5 h-5" />
              Dossier de Consultation
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Suivi des consultations et historique médical.
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Consultation
          </Button>
        </CardHeader>
      </Card>

      <ModalV2
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        panelClassName="sm:max-w-4xl"
      >
        <NewConsultationForm
          id={id}
          onClose={() => setIsOpen(false)}
          refreshConsultations={fetchConsultations}
        />
      </ModalV2>

      <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
        {consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10">
            <Stethoscope className="w-12 h-12 opacity-20 mb-3" />
            <p className="font-medium">Aucune consultation pour le moment</p>
            <p className="text-sm opacity-70 mt-1">
              Cliquez sur "Nouvelle Consultation" pour commencer.
            </p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Raison de visite
                    </div>
                  </TableHead>
                  <TableHead>
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
                {consultations
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((cons) => (
                    <TableRow
                      key={cons.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenConsultationId(cons.id.toString());
                      }}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {new Date(cons.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-1">
                          {cons.reason || (
                            <span className="text-muted-foreground italic">
                              Non spécifié
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-1">
                          {cons.diagnosis ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {cons.diagnosis}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">
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
                            consultationId={cons.id.toString()}
                            setData={setConsultations}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {openConsultationId && (
        <ModalV2
          isOpen
          onClose={() => setOpenConsultationId(null)}
          panelClassName="sm:max-w-4xl"
        >
          <SingleConsultation
            id={openConsultationId}
            onClose={() => {
              setOpenConsultationId(null);
              fetchConsultations();
            }}
          />
        </ModalV2>
      )}
    </div>
  );
}

export default ConsultationForm;
