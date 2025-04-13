import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MoreVertical, TrashIcon } from "lucide-react";
import { Patient, Prescription } from "../../type";
import DeletePrescriptionDialogue from "./DeletePrescriptionDialogue";
import PrintButton from "./PrintButton";

interface DropDownProps {
  prescription: Prescription;
  setData: React.Dispatch<React.SetStateAction<Prescription[]>>;
  patient: Patient;
}
function DropDown({ prescription, setData, patient }: DropDownProps) {
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
            Remove
          </DropdownMenuItem>
        </DeletePrescriptionDialogue>
        <PrintButton patient={patient} window={window} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropDown;
