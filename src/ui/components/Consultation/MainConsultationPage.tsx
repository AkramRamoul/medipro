import { useEffect, useState } from "react";
import Modal from "../Modal";
import NewConsultationForm from "./NewConsultationForm";
import { Button } from "../ui/button";
import { Consultation } from "../../type";
import { formatDate } from "../../lib/utils";

function ConsultationForm({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Fetch consultations when component mounts or id changes
  useEffect(() => {
    const fetchConsultations = async () => {
      const data = await window.electronAPI.getConsultations(id);
      setConsultations(data);
    };
    fetchConsultations();
  }, [id]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg max-w-[80%] mx-auto">
      <Button onClick={() => setIsOpen(true)} className="mb-4 w-full">
        New Consultation
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NewConsultationForm id={id} onClose={() => setIsOpen(false)} />
      </Modal>

      {/* Render consultations */}
      <div className="mt-4 space-y-4">
        {consultations.map((consultation) => (
          <div
            key={consultation.id}
            className="p-4 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors"
          >
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
    </div>
  );
}

export default ConsultationForm;
