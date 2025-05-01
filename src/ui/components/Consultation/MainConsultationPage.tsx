import { useCallback, useEffect, useState } from "react";
import Modal from "../Modal";
import NewConsultationForm from "./NewConsultationForm";
import { Button } from "../ui/button";
import { Consultation } from "../../type";
import { formatDate } from "../../lib/utils";
import DeleteDialogue from "../DeleteDialogue";
import SingleConsultation from "./SingleConsultation";

function ConsultationForm({ id }: { id: string }) {
  const [isConsOpen, setIsConsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

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

  return (
    <div className="p-4 bg-background dark:bg-background rounded-xl max-w-[80%] mx-auto">
      <Button onClick={() => setIsOpen(true)} className="mb-4 w-full">
        New Consultation
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
          No consultations yet. Click "New Consultation" to add one.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="p-4 border border-border rounded-xl shadow-sm bg-muted hover:bg-accent transition-colors cursor-pointer flex justify-between items-center"
            >
              <div
                className="flex-1 flex flex-col items-center"
                onClick={() => setIsConsOpen(true)}
              >
                <p className="text-sm text-muted-foreground font-medium truncate">
                  <strong className="text-foreground">Date:</strong>{" "}
                  {formatDate(consultation.date)}
                </p>
                <p className="text-sm text-muted-foreground font-medium truncate">
                  <strong className="text-foreground">Reason:</strong>{" "}
                  {consultation.reason}
                </p>
                <p className="text-sm text-muted-foreground font-medium truncate">
                  <strong className="text-foreground">Diagnosis:</strong>{" "}
                  {consultation.diagnosis}
                </p>
              </div>

              <DeleteDialogue
                consultationId={consultation.id}
                setData={setConsultations}
              />

              <Modal isOpen={isConsOpen} onClose={() => setIsConsOpen(false)}>
                <SingleConsultation
                  id={consultation.id}
                  onClose={() => {
                    setIsConsOpen(false);
                    fetchConsultations();
                  }}
                />
              </Modal>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConsultationForm;
