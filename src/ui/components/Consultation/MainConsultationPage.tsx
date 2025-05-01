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
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl max-w-[80%] mx-auto">
      <Button
        onClick={() => setIsOpen(true)}
        className="mb-4 w-full dark:text-white"
      >
        New Consultation
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NewConsultationForm
          id={id}
          onClose={() => setIsOpen(false)}
          refreshConsultations={fetchConsultations}
        />
      </Modal>

      {/* No consultations message */}
      {consultations.length === 0 ? (
        <div className="mt-4 p-4 text-center text-gray-500 dark:text-gray-400 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          No consultations yet. Click "New Consultation" to add one.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="p-4 border dark:border-gray-700 rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex justify-between items-center"
            >
              <div className="flex-1" onClick={() => setIsConsOpen(true)}>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
                  <strong className="text-gray-800 dark:text-white">
                    Date:
                  </strong>{" "}
                  {formatDate(consultation.date)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
                  <strong className="text-gray-800 dark:text-white">
                    Reason:
                  </strong>{" "}
                  {consultation.reason}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
                  <strong className="text-gray-800 dark:text-white">
                    Diagnosis:
                  </strong>{" "}
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
