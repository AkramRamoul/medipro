import { useCallback, useEffect, useState } from "react";
import Modal from "../Modal";
import { Button } from "../ui/button";
import NewPrescriptionForm from "./NewPrescriptionForm";

import { Patient, Prescription } from "../../type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import PrescriptionRow from "./PrescriptionRow";

function MainPrescriptionPage({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [patient, setPatient] = useState<Patient | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const data = await window.electronAPI.getPatientPrescriptions(id);
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);
  useEffect(() => {
    if (id) {
      window.electronAPI
        .getpatient(id)
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        .then((data: any) => {
          const extractedPatient = data[0]
            ? { ...data[0], createdAt: data.createdAt }
            : null;
          console.log("📢 djsf Patient Data:", extractedPatient);
          setPatient(extractedPatient);
        })
        .catch((error: Error) =>
          console.error("Error fetching patient:", error)
        );
    }
  }, [id]);

  return (
    <>
      <div className="p-4 bg-background rounded-xl max-w-[80%] mx-auto">
        <Button
          onClick={() => setIsOpen(true)}
          className="mb-4 w-full text-white"
        >
          Nouvelle ordonnance
        </Button>
      </div>

      <div className="p-4 bg-background rounded-xl shadow-lg max-w-[80%] mx-auto">
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <NewPrescriptionForm
            id={id}
            onClose={() => setIsOpen(false)}
            refreshPrescriptions={fetchPrescriptions}
            patient={patient!}
          />
        </Modal>

        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[45%] text-foreground">Date</TableHead>
              <TableHead className="hidden md:table-cell text-foreground">
                Temps
              </TableHead>
              <TableHead className="text-right text-foreground">
                Options{" "}
              </TableHead>
            </TableRow>
          </TableHeader>

          {prescriptions.length === 0 ? (
            <TableBody>
              <TableRow className="hover:bg-transparent border-none">
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucune ordonnance pour le moment. Cliquez sur "Nouvelle
                  ordonnance" pour en ajouter une.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {prescriptions.map((prescription, index) => (
                <PrescriptionRow
                  key={index}
                  prescription={prescription}
                  setData={setPrescriptions}
                  patinet={patient!} // typo here
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>
    </>
  );
}

export default MainPrescriptionPage;
