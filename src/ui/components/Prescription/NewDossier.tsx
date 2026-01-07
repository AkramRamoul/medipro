import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {
  Check,
  FileText,
  FlaskConical,
  FileBadge,
  ClipboardList,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const documentTypes = [
  { value: "PRESCRIPTION", label: "Prescription", icon: FileText },
  { value: "BLOOD_WORK", label: "Analyse / Bilan sanguin", icon: FlaskConical },
  { value: "CERTIFICATE", label: "Certificat médical", icon: FileBadge },
  { value: "REPORT", label: "Compte rendu", icon: ClipboardList },
];

export function DocumentTypeSelector({
  onSelect,
}: {
  onSelect: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-fit justify-between">
          Sélectionner le type de document a créer
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-64">
        <Command>
          <CommandInput placeholder="Rechercher…" />

          <CommandEmpty>Aucun résultat.</CommandEmpty>

          <CommandGroup heading="Types de documents">
            {documentTypes.map((doc) => {
              const Icon = doc.icon;
              return (
                <CommandItem
                  key={doc.value}
                  value={doc.value}
                  onSelect={() => {
                    setSelected(doc.value);
                    setOpen(false);
                    onSelect(doc.value);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />

                  {doc.label}

                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selected === doc.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
