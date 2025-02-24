import React from "react";
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
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const addPatient = (patientData: Patient) => {
    setPatients([...patients, patientData]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AddPatientForm onClose={onClose} onSave={addPatient} />
    </Modal>
  );
}

export default NewPatientModal;
