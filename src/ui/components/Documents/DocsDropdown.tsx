import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { MoreVertical, TrashIcon } from "lucide-react";
import { Document, Patient } from "../../type";

import DeleteDocButton from "./DeleteDocButton";
import DocPrint from "./DocPrint";

interface DropDownProps {
  document: Document;
  setData: React.Dispatch<React.SetStateAction<Document[]>>;
  patinet: Patient;
}
function DocsDropDown({ document, setData, patinet }: DropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="rounded-full">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="">
        <DeleteDocButton docId={document.id.toString()} setData={setData}>
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
        </DeleteDocButton>
        <DocPrint patient={patinet} window={window} document={document} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DocsDropDown;
