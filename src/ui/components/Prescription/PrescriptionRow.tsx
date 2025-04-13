import { TableRow, TableCell } from "../../components/ui/table";
import { format } from "date-fns";
// import DropDown from "./DropDown";
import { Patient, Prescription } from "../../type";
import { useState } from "react";
import Modal from "../Modal";
import SinglePrescription from "./SinglePrescription";
import DropDown from "./DropDown";
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
        <TableCell className="w-[45%] font-medium text-left">
          {prescription.date
            ? format(new Date(prescription.date), "MMM d, yyyy")
            : "Invalid Date"}
        </TableCell>

        {/* Time - Hidden on small screens, visible on md+ */}
        <TableCell className="hidden md:table-cell text-left text-muted-foreground">
          {prescription.date
            ? format(new Date(prescription.date), "hh:mm a")
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
        {selectedPrescription && (
          <SinglePrescription
            meds={selectedPrescription.medications}
            onClose={() => setSelectedPrescription(null)}
          />
        )}
      </Modal>
    </>
  );
}

export default PrescriptionRow;
