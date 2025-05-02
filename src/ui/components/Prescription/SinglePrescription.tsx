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
        <div className="mt-4 p-4">
          <h3 className="font-semibold mb-2 text-foreground">Medications:</h3>
          <ul className="space-y-2">
            {meds.map((med, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted p-2 rounded"
              >
                <span className="text-sm dark:text-white">
                  {med.medicineName} {med.form ? `${med.form}` : ""}{" "}
                  {med.dosage} {med.quantity ? `${med.quantity}` : ""}{" "}
                  {med.duration ? `${med.duration}` : ""} {med.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end mt-4 space-x-3 px-4">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <PrintButton prescription={meds} patient={patient} window={window} />
      </div>
    </div>
  );
}

export default SinglePrescription;
