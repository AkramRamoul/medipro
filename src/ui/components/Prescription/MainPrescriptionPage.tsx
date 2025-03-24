import { useEffect, useState } from "react";
import Modal from "../Modal";
import { Button } from "../ui/button";
import NewPrescriptionForm from "./NewPrescriptionForm";
import SinglePrescription from "./SinglePrescription";

function MainPrescriptionPage({ id }: { id: string }) {
  const [isPrescOpen, setIsPrescOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Fetch consultations when component mounts or id changes
  useEffect(() => {
    const fetchPrescriptions = async () => {
      const data = await window.electronAPI.getPatientPrescriptions(id);
      setPrescriptions(data);
    };
    fetchPrescriptions();
  }, [id]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg max-w-[80%] mx-auto">
      <Button onClick={() => setIsOpen(true)} className="mb-4 w-full">
        New Prescription
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NewPrescriptionForm id={id} onClose={() => setIsOpen(false)} />
      </Modal>

      {/* Render consultations */}
      <div className="mt-4 space-y-4">
        {prescriptions.map((prescription) => (
          <div
            onClick={() => setIsPrescOpen(true)}
            key={prescription.id}
            className="p-4 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Modal isOpen={isPrescOpen} onClose={() => setIsPrescOpen(false)}>
              <SinglePrescription
                onClose={() => setIsPrescOpen(false)}
                meds={prescription.medications}
              />
            </Modal>
            <p className="text-sm text-gray-600 font-medium truncate">
              <strong className="text-gray-800">Date:</strong>{" "}
              {prescription.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPrescriptionPage;
