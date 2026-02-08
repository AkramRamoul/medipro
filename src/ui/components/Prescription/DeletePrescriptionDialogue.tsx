"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogCancel,
} from "../../components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteDialogueProps {
  priscriptionId: string;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  children: React.ReactNode;

  setData: React.Dispatch<React.SetStateAction<any[]>>; // Pass setData as a prop
}

function DeleteDialogue({
  priscriptionId,
  setData,
  children,
}: DeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);

    window.electronAPI
      .deletePrescription(priscriptionId) // ✅ Fixed typo
      .then(() => {
        setData((prev) =>
          prev.filter((item) => item.id !== Number(priscriptionId))
        );
        toast.success("Ordonnance supprimée avec succès");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Échec de la suppression de la prescription");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'ordonnance</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette ordonnance ? Cette action
            est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialogue;
