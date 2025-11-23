import { useCallback, useEffect, useState } from "react";
import Modal from "../Modal";
import NewConsultationForm from "./NewConsultationForm";
import { Button } from "../ui/button";
import { Consultation } from "../../type";
import DeleteDialogue from "../DeleteDialogue";
import SingleConsultation from "./SingleConsultation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "../Pagination";

function ConsultationForm({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(
    null
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
    <div className="p-4 bg-background dark:bg-background rounded-xl max-w-[80%] mx-auto">
      <Button
        onClick={() => setIsOpen(true)}
        className="mb-4 w-full text-white"
      >
        Nouvelle consultation{" "}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NewConsultationForm
          id={id}
          onClose={() => setIsOpen(false)}
          refreshConsultations={fetchConsultations}
        />
      </Modal>

      {consultations.length === 0 ? (
        <div className="mt-4 p-4 text-center text-muted-foreground border border-border rounded-lg bg-muted">
          Aucune consultation pour le moment. Cliquez sur "Nouvelle
          consultation" pour en ajouter une.{" "}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Table>
            <TableCaption className="mt-6 text-muted-foreground">
              Une liste de toutes vos consultations.{" "}
            </TableCaption>
            <TableHeader className="rounded-t-xl overflow-hidden">
              <TableRow className="bg-muted">
                <TableHead className="text-muted-foreground rounded-tl-xl">
                  Date
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Reason de visite
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Diagnostic
                </TableHead>
                <TableHead className="text-muted-foreground w-[80px] rounded-tr-xl">
                  <div className="flex justify-center items-center">
                    Supprimer
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.length > 0 ? (
                consultations
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((cons) => (
                    <TableRow
                      key={cons.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenConsultationId(cons.id.toString());
                      }}
                      className="hover:bg-muted transition-colors cursor-pointer"
                    >
                      <TableCell className="text-foreground">
                        {new Date(cons.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {cons.reason || "N/A"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {cons.diagnosis || "N/A"}
                      </TableCell>
                      <TableCell className="w-[80px]">
                        <div className="flex justify-center items-center h-full">
                          <DeleteDialogue
                            consultationId={cons.id.toString()}
                            setData={setConsultations}
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
                    Aucune consultation trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="mt-6">
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
      {openConsultationId && (
        <Modal isOpen onClose={() => setOpenConsultationId(null)}>
          <SingleConsultation
            id={openConsultationId}
            onClose={() => {
              setOpenConsultationId(null);
              fetchConsultations();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default ConsultationForm;
