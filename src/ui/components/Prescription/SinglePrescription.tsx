import { PrescriptionMed } from "../../../electron/schema";

function SinglePrescription({
  meds,
}: {
  onClose: () => void;
  meds: PrescriptionMed[];
}) {
  console.log(meds);
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
                  {med.medicineName} - {med.form} ({med.dosage}) |{med.quantity}{" "}
                  | {med.duration} | {med.note} |{" "}
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
