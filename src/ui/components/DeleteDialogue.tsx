"use client";
import { TrashIcon } from "lucide-react";
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
} from "../components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import api from "../axios";

interface DeleteDialogueProps {
  consultationId: string;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  children?: React.ReactNode;

  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

function DeleteDialogue({
  consultationId,
  setData,
  children,
}: DeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);

    api.delete(`/consultation/${consultationId}`)
      .then(() => {
        setData((prev) =>
          prev.filter((item) => item.id !== Number(consultationId)),
        );
        toast.success("Consultation supprimée avec succès");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Échec de la suppression de la consultation");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
            aria-label="Delete consultation"
          >
            <TrashIcon className="h-5 w-5 text-muted-foreground hover:text-destructive hover:scale-110 transition-transform" />
          </button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la consultationn</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action
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
