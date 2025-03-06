import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import { AddPatientForm } from "./Form";

type Patient = {
  name: string;
  age: number;
  gender: "Male" | "Female";
  contact: string;
};
interface NewPatientModalProps {
  isOpen?: boolean;
  onClose: () => void;
}
function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const navigate = useNavigate();

  const handleSave = async (data: Patient) => {
    console.log("Saving patient:", data);
    try {
      // Await the returned ID from the backend
      const newPatientId = await window.electronAPI.addPatient(data);
      console.log("Patient saved with ID:", newPatientId);
      onClose();

      // Navigate to /pat/:id after saving
      navigate(`/pat/${newPatientId}`);
    } catch (error) {
      console.error("Failed to save patient:", error);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Modal isOpen={isOpen} onClose={onClose}>
        <AddPatientForm onClose={onClose} onSave={handleSave} />
      </Modal>
    </div>
  );
}

export default NewPatientModal;
