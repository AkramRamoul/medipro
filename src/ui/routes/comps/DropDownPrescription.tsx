import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { MoreVertical, TrashIcon } from "lucide-react";
import {
  smallPatient,
  Prescription,
  PrescriptionWithPatient,
} from "../../type";
import { PrescriptionMed } from "../../../electron/schema";
import DeletePrescriptionDialogue from "../../components/Prescription/DeletePrescriptionDialogue";
import PrintButton from "../../components/Prescription/PrintButton";

interface DropDownProps {
  prescription: Prescription;
  setData: React.Dispatch<React.SetStateAction<PrescriptionWithPatient[]>>;
  patient: smallPatient;
  medications: PrescriptionMed[];
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
}
function DropDown({
  prescription,
  setData,
  patient,
  medications,
}: DropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="rounded-full">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="">
        <DeletePrescriptionDialogue
          priscriptionId={prescription.id.toString()}
          setData={setData}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <TrashIcon className="size-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DeletePrescriptionDialogue>
        <PrintButton
          patient={patient}
          window={window}
          prescription={medications}
          isPsychotropic={prescription.isPsychotropic}
          psychotropicNumber={prescription.psychotropicNumber}
          patientAddress={prescription.patientAddress}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropDown;
