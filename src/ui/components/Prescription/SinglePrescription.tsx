import { PrescriptionMed } from "../../../electron/schema";

function SinglePrescription({
  meds,
}: {
  onClose: () => void;
  meds: PrescriptionMed[];
}) {
  return (
    <div>
      {meds.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Selected Medications:</h3>
          <ul className="space-y-2">
            {meds.map((med, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span>
                  {med.medicineName} - {med.dosage} ({med.dosage}) |{" "}
                  {med.duration} | {med.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SinglePrescription;
