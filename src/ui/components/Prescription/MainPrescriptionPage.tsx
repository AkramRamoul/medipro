import { useCallback, useEffect, useState } from "react";
import Modal from "../Modal";
import NewPrescriptionForm from "./NewPrescriptionForm";

import { Patient, Prescription, Document } from "../../type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import PrescriptionRow from "./PrescriptionRow";
import { DocumentTypeSelector } from "./NewDossier";
import { MedicalCertificate } from "../Documents/MedicalCertificate";
import { BloodWork } from "../Documents/BloodWork";
import { MedicalReport } from "../Documents/MedicalReport";
import DocumentRow from "../Documents/DocumentRow";

function MainPrescriptionPage({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState<
    null | "PRESCRIPTION" | "BLOOD_WORK" | "CERTIFICATE" | "REPORT"
  >(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [patient, setPatient] = useState<Patient | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const presData = await window.electronAPI.getPatientPrescriptions(id);
      setPrescriptions(presData);
      const docData = await window.electronAPI.getPatientDocuments(id);
      setDocuments(docData);
    } catch (error) {
      console.error("Error fetching data:", error);
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
        <DocumentTypeSelector
          onSelect={(type) => {
            setIsOpen(true);
            if (
              ["PRESCRIPTION", "BLOOD_WORK", "CERTIFICATE", "REPORT"].includes(
                type
              )
            ) {
              setDocType(
                type as "PRESCRIPTION" | "BLOOD_WORK" | "CERTIFICATE" | "REPORT"
              );
              setIsOpen(true);
            }
          }}
        />
      </div>

      <div className="p-4 bg-background rounded-xl shadow-lg max-w-[80%] mx-auto">
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {docType === "PRESCRIPTION" && (
            <NewPrescriptionForm
              id={id}
              onClose={() => setIsOpen(false)}
              refreshPrescriptions={fetchPrescriptions}
              patient={patient!}
            />
          )}

          {docType === "BLOOD_WORK" && (
            <BloodWork
              patient={patient!}
              onClose={() => setIsOpen(false)}
              refreshDocuments={fetchPrescriptions}
            />
          )}

          {docType === "CERTIFICATE" && (
            <MedicalCertificate
              type={"CERTIFICATE"}
              patientId={id}
              onClose={() => setIsOpen(false)}
              refreshDocuments={fetchPrescriptions}
            />
          )}

          {docType === "REPORT" && (
            <MedicalReport
              patientId={id}
              onClose={() => setIsOpen(false)}
              type={"REPORT"}
              refreshDocuments={fetchPrescriptions}
            />
          )}
        </Modal>

        <Table>
          <TableHeader className="bg-muted rounded-t-xl overflow-hidden">
            <TableRow>
              <TableHead className="w-[30%] text-foreground rounded-tl-xl">
                Date
              </TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="hidden md:table-cell text-foreground">
                Temps
              </TableHead>
              <TableHead className="text-right text-foreground rounded-tr-xl">
                Options{" "}
              </TableHead>
            </TableRow>
          </TableHeader>

          {prescriptions.length === 0 && documents.length === 0 ? (
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
              {[
                ...prescriptions.map((p) => ({
                  ...p,
                  kind: "prescription" as const,
                })),
                ...documents.map((d) => ({ ...d, kind: "document" as const })),
              ]
                .sort((a, b) => {
                  const dateA = new Date(
                    a.kind === "prescription" ? a.date || 0 : a.createdAt || 0
                  ).getTime();
                  const dateB = new Date(
                    b.kind === "prescription" ? b.date || 0 : b.createdAt || 0
                  ).getTime();
                  return dateB - dateA;
                })
                .map((item, index) =>
                  item.kind === "prescription" ? (
                    <PrescriptionRow
                      key={`pres-${index}`}
                      prescription={item}
                      setData={setPrescriptions}
                      patinet={patient!}
                    />
                  ) : (
                    <DocumentRow
                      key={`doc-${index}`}
                      document={item}
                      setData={setDocuments}
                      patinet={patient!}
                    />
                  )
                )}
            </TableBody>
          )}
        </Table>
      </div>
    </>
  );
}

export default MainPrescriptionPage;
