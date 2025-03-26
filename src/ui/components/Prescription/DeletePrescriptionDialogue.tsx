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
} from "../../components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteDialogueProps {
  priscriptionId: string;
  /* eslint-disable  @typescript-eslint/no-explicit-any */

  setData: React.Dispatch<React.SetStateAction<any[]>>; // Pass setData as a prop
}

function DeleteDialogue({ priscriptionId, setData }: DeleteDialogueProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);

    window.electronAPI
      .deletePrescription(priscriptionId) // ✅ Fixed typo
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== priscriptionId)); // ✅ Update state
        toast.success("Prescription deleted successfully");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to delete prescription");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <TrashIcon
          className="size-4 mr-2 cursor-pointer hover:text-destructive hover:scale-110"
          onClick={(e) => e.stopPropagation()} // ✅ Prevent opening modal
        />
      </AlertDialogTrigger>

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Prescription</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this prescription? This action
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
