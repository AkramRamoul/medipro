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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pill, FileText, Clock, Calendar } from "lucide-react";

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
      <div className="space-y-6 max-w-[80%] mx-auto">
        <div className="flex flex-col gap-4">
          <Card className="border-none shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 text-primary">
                <Pill className="w-5 h-5" />
                Gestion des Ordonnances et Documents
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Créez et gérez les documents médicaux pour {patient?.first_name} {patient?.last_name}
              </p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
          <div className="bg-muted/30 p-3 border-b flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="w-4 h-4" />
            Historique des documents
          </div>

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
                patient={patient!}
                onClose={() => setIsOpen(false)}
                refreshDocuments={fetchPrescriptions}
              />
            )}

            {docType === "REPORT" && (
              <MedicalReport
                patient={patient!}
                onClose={() => setIsOpen(false)}
                type={"REPORT"}
                refreshDocuments={fetchPrescriptions}
              />
            )}
          </Modal>

          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[30%]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Date
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Temps
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  Options
                </TableHead>
              </TableRow>
            </TableHeader>

            {prescriptions.length === 0 && documents.length === 0 ? (
              <TableBody>
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p>Aucun document pour le moment.</p>
                      <p className="text-xs opacity-70">Sélectionnez un type de document ci-dessus pour commencer.</p>
                    </div>
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
      </div>
    </>
  );
}

export default MainPrescriptionPage;
