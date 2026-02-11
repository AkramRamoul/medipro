import { useCallback, useEffect, useState } from "react";
import NewConsultationForm from "./NewConsultationForm";
import { Button } from "../ui/button";
import { Consultation } from "../../type";
import SingleConsultation from "./SingleConsultation";
import { ConsultationCard } from "./ConsultationCard";
import Pagination from "../Pagination";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Stethoscope, Plus } from "lucide-react";
import ModalV2 from "../Modalsecond";

function ConsultationForm({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(
    null,
  );

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

      <div className="rounded-xl">
        {consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
            <Stethoscope className="w-12 h-12 opacity-20 mb-3" />
            <p className="font-medium">Aucune consultation pour le moment</p>
            <p className="text-sm opacity-70 mt-1">
              Cliquez sur "Nouvelle Consultation" pour commencer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultations
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((cons) => (
                <ConsultationCard
                  key={cons.id}
                  consultation={cons}
                  onClick={() => setOpenConsultationId(cons.id.toString())}
                  onDelete={async () => {
                    await window.electronAPI.deleteCosultaion(cons.id.toString());
                    fetchConsultations();
                    window.dispatchEvent(
                      new CustomEvent("patient-vitals-updated", {
                        detail: { patientId: Number(id) },
                      }),
                    );
                    window.dispatchEvent(new Event("consultations-updated"));
                  }}
                />
              ))}
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
