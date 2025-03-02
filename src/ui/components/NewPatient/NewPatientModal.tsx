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
  const handleSave = async (data: Patient) => {
    console.log("Saving patient:", data); // Debugging log
    try {
      await window.electronAPI.addPatient(data); // Ensure this function exists
      console.log("!");
      onClose();
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
