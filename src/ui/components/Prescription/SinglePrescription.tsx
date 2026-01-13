import { PrescriptionMed } from "../../../electron/schema";
import { smallPatient } from "../../type";
import PrintButton from "../PrintButton";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

function SinglePrescription({
  onClose,
  meds,
  patient,
  isPsychotropic,
  psychotropicNumber,
  patientAddress,
}: {
  onClose: () => void;
  meds: PrescriptionMed[];
  patient: smallPatient;
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
}) {
  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle>Médicaments</CardTitle>
      </CardHeader>
      <CardContent>
        {meds.length > 0 ? (
          <ul className="space-y-2">
            {meds.map((med, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {med.medicineName} {med.form}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {med.dosage} {med.quantity && `- ${med.quantity}`}{" "}
                    {med.duration && `- ${med.duration}`}
                  </span>
                  {med.note && (
                    <span className="text-xs text-muted-foreground italic mt-1">
                      Note: {med.note}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun médicament prescrit.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <PrintButton
          prescription={meds}
          patient={patient}
          window={window}
          isPsychotropic={isPsychotropic}
          psychotropicNumber={psychotropicNumber}
          patientAddress={patientAddress}
        />
      </CardFooter>
    </Card>
  );
}

export default SinglePrescription;
