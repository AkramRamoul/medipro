import { useEffect, useState } from "react";

const MedicationsList = () => {
  const [medications, setMedications] = useState<
    { name: string; form: string; dosage: string }[]
  >([]);

  const fetchMedications = async () => {
    try {
      const meds = await window.electronAPI.getMedications();
      console.log("Medications:", meds);
      setMedications(meds);
    } catch (err) {
      console.error("Failed to load medications:", err);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <div>
      <h2>Medications List</h2>
      <ul>
        {medications.map((med, index) => (
          <li key={index}>
            {med.name} - {med.form} - {med.dosage}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicationsList;
