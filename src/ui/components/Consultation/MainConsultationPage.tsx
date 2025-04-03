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
    <div className="p-4 bg-white rounded-xl shadow-lg max-w-[80%] mx-auto">
      <Button onClick={() => setIsOpen(true)} className="mb-4 w-full">
        New Consultation
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NewConsultationForm
          id={id}
          onClose={() => setIsOpen(false)}
          refreshConsultations={fetchConsultations} // ✅ Pass refresh function
        />
      </Modal>

      {/* ✅ Show message if no consultations exist */}
      {consultations.length === 0 ? (
        <div className="mt-4 p-4 text-center text-gray-500 border rounded-lg bg-gray-50">
          No consultations yet. Click "New Consultation" to add one.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {consultations.map((consultation) => (
            <div
              onClick={() => setIsConsOpen(true)}
              key={consultation.id}
              className="p-4 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Modal isOpen={isConsOpen} onClose={() => setIsConsOpen(false)}>
                <SingleConsultation
                  id={consultation.id}
                  onClose={() => {
                    setIsConsOpen(false);
                    fetchConsultations();
                  }}
                />
              </Modal>

              <DeleteDialogue
                consultationId={consultation.id}
                setData={setConsultations}
              />
              <p className="text-sm text-gray-600 font-medium truncate">
                <strong className="text-gray-800">Date:</strong>{" "}
                {formatDate(consultation.date)}
              </p>
              <p className="text-sm text-gray-600 font-medium truncate">
                <strong className="text-gray-800">Reason:</strong>{" "}
                {consultation.reason}
              </p>
              <p className="text-sm text-gray-600 font-medium truncate">
                <strong className="text-gray-800">Diagnosis:</strong>{" "}
                {consultation.diagnosis}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConsultationForm;
