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

interface DeleteDialogueProps {
  consultationId: string;
  /* eslint-disable  @typescript-eslint/no-explicit-any */

  setData: React.Dispatch<React.SetStateAction<any[]>>; // Pass setData as a prop
}

function DeleteDialogue({ consultationId, setData }: DeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);

    window.electronAPI
      .deleteCosultaion(consultationId) // ✅ Fixed typo
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== consultationId)); // ✅ Update state
        toast.success("Consultation deleted successfully");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to delete consultation");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <TrashIcon className="size-4 mr-2 cursor-pointer" />
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Consultation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this consultation? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialogue;
