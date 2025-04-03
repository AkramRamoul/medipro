import { useCallback, useEffect, useState } from "react";
import Modal from "../Modal";
import { Button } from "../ui/button";
import NewPrescriptionForm from "./NewPrescriptionForm";
import SinglePrescription from "./SinglePrescription";
import DeletePrescriptionDialogue from "./DeletePrescriptionDialogue";
import { Prescription } from "../../type";
import { formatDate } from "../../lib/utils";
function MainPrescriptionPage({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const data = await window.electronAPI.getPatientPrescriptions(id);
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);
  return (
    <div className="p-4 bg-white rounded-xl shadow-lg max-w-[80%] mx-auto">
      <Button onClick={() => setIsOpen(true)} className="mb-4 w-full">
        New Prescription
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <NewPrescriptionForm
          id={id}
          onClose={() => setIsOpen(false)}
          refreshPrescriptions={fetchPrescriptions}
        />
      </Modal>

      {/* Prescription List */}
      {prescriptions.length === 0 ? (
        <div className="mt-4 p-4 text-center text-gray-500 border rounded-lg bg-gray-50">
          No prescriptions yet. Click "New Consultation" to add one.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              onClick={() => setSelectedPrescription(prescription)}
              className="p-4 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer "
            >
              <DeletePrescriptionDialogue
                priscriptionId={prescription.id.toString()}
                setData={setPrescriptions}
              />

              <p className="text-sm text-gray-600 font-medium truncate">
                <strong className="text-gray-800">Oradonance Du :</strong>{" "}
                {formatDate(prescription.date || "")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Single Prescription Modal */}
      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      >
        {selectedPrescription && (
          <SinglePrescription
            meds={selectedPrescription.medications}
            onClose={() => setSelectedPrescription(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default MainPrescriptionPage;
