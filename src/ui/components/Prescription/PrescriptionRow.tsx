import { TableRow, TableCell } from "../../components/ui/table";
import { format } from "date-fns";
import { Patient, Prescription } from "../../type";
import { useState } from "react";
import Modal from "../Modal";
import SinglePrescription from "./SinglePrescription";
import DropDown from "./DropDown";
import { cn } from "../../lib/utils";
interface PrescriptionRowProps {
  prescription: Prescription;
  setData: React.Dispatch<React.SetStateAction<Prescription[]>>;
  patinet: Patient;
}
function PrescriptionRow({
  prescription,
  setData,
  patinet,
}: PrescriptionRowProps) {
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  return (
    <>
      <TableRow
        onClick={() => setSelectedPrescription(prescription)}
        className="cursor-pointer"
      >
        {/* Date - Always visible */}
        <TableCell className="w-[30%] font-medium text-left">
          {prescription.createdAt
            ? new Date(prescription.createdAt).toLocaleDateString("fr-FR")
            : prescription.date
              ? new Date(prescription.date).toLocaleDateString("fr-FR")
              : "Invalid Date"}
        </TableCell>

        <TableCell className="text-left">Ordonnance</TableCell>

        {/* Time - Hidden on small screens, visible on md+ */}
        <TableCell className="hidden md:table-cell text-left text-muted-foreground">
          {prescription.createdAt
            ? format(new Date(prescription.createdAt), "HH:mm")
            : prescription.date
              ? format(new Date(prescription.date), "HH:mm")
              : "N/A"}
        </TableCell>

        {/* Actions - Always visible */}
        <TableCell className="flex justify-end">
          <DropDown
            prescription={prescription}
            setData={setData}
            patient={patinet}
            medications={prescription.medications}
          />
        </TableCell>
      </TableRow>

      <Modal
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      >
        {/* We keep the content rendered during leave transition by checking if we have either the selected one or we're in the process of closing */}
        {(selectedPrescription || (!!selectedPrescription === false)) && (
          <div className={cn(!selectedPrescription && "pointer-events-none")}>
            <SinglePrescription
              meds={selectedPrescription?.medications || []}
              onClose={() => setSelectedPrescription(null)}
              patient={patinet}
              isPsychotropic={selectedPrescription?.isPsychotropic}
              psychotropicNumber={selectedPrescription?.psychotropicNumber}
              patientAddress={selectedPrescription?.patientAddress}
              prescriptionDate={selectedPrescription?.date}
              createdAt={selectedPrescription?.createdAt}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

export default PrescriptionRow;
