import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import { AddPatientForm } from "./Form";
import { toast } from "sonner";

type Patient = {
  first_name: string;
  last_name: string;
  age: number;
  gender: "Male" | "Female";
  weight?: number;
  contact?: string;
  notes?: string;
};
interface NewPatientModalProps {
  isOpen?: boolean;
  onClose: () => void;
}
function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const navigate = useNavigate();

  const handleSave = async (data: Patient) => {
    try {
      const newPatientId = await window.electronAPI.addPatient(data);
      window.dispatchEvent(new Event("patients-updated"));
      toast.success("Patient enregistré avec succès !");
      onClose();

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
