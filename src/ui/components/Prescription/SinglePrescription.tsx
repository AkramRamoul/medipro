import { PrescriptionMed } from "../../../electron/schema";
import { smallPatient } from "../../type";
import PrintButton from "../PrintButton";
import { Button } from "../ui/button";

function SinglePrescription({
  onClose,
  meds,
  patient,
}: {
  onClose: () => void;
  meds: PrescriptionMed[];
  patient: smallPatient;
}) {
  console.log(meds);
  return (
    <div>
      {meds.length > 0 && (
        <div className="mt-4 p-2">
          <h3 className="font-semibold mb-2"> Medications:</h3>
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
      <div className="flex justify-end mt-4 space-x-3">
        <Button
          onClick={() => {
            onClose();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </Button>
        <PrintButton
          prescription={meds}
          patient={patient}
          window={window}
        ></PrintButton>
      </div>
    </div>
  );
}

export default SinglePrescription;
