import { useCallback, useEffect, useState } from "react";
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
import { BloodWork } from "../Documents/BloodWork";
import DocumentRow from "../Documents/DocumentRow";
import { SingleDocument } from "../Documents/SingleDocument";
import NewDocumentFromTemplate from "../Documents/NewDocumentFromTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pill, FileText, Clock, Calendar } from "lucide-react";
import ModalV2 from "../Modalsecond";
import Pagination from "../Pagination";
import { Button } from "../ui/button";

const ITEMS_PER_PAGE = 8;

function MainPrescriptionPage({
  id,
  mode = "prescriptions",
}: {
  id: string;
  mode?: "prescriptions" | "letters";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState<
    null | "PRESCRIPTION" | "BLOOD_WORK" | "CERTIFICATE" | "REPORT" | "TEMPLATE"
  >(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any | null
  >(null);

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
          setPatient(extractedPatient);
        })
        .catch((error: Error) =>
          console.error("Error fetching patient:", error),
        );
    }
  }, [id]);

  const allItems = useCallback(() => {
    const base =
      mode === "prescriptions"
        ? [
          ...prescriptions.map((p) => ({
            ...p,
            kind: "prescription" as const,
          })),
          ...documents
            .filter((d) => d.type === "blood")
            .map((d) => ({ ...d, kind: "document" as const })),
        ]
        : documents
          .filter((d) => d.type !== "blood")
          .map((d) => ({ ...d, kind: "document" as const }));

    return base.sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const dateA = getTime(a.kind === "prescription" ? a.date : a.createdAt);
      const dateB = getTime(b.kind === "prescription" ? b.date : b.createdAt);
      return dateB - dateA;
    });
  }, [prescriptions, documents, mode])();

  if (
    isOpen &&
    !viewingDocument &&
    (docType === "PRESCRIPTION" ||
      docType === "BLOOD_WORK" ||
      selectedTemplateForEdit)
  ) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {docType === "PRESCRIPTION" && patient && (
          <NewPrescriptionForm
            id={id}
            onClose={() => setIsOpen(false)}
            refreshPrescriptions={fetchPrescriptions}
            patient={patient}
          />
        )}
        {docType === "BLOOD_WORK" && patient && (
          <BloodWork
            patient={patient}
            onClose={() => setIsOpen(false)}
            refreshDocuments={fetchPrescriptions}
          />
        )}
        {selectedTemplateForEdit && patient && (
          <NewDocumentFromTemplate
            patient={patient}
            initialTemplate={selectedTemplateForEdit}
            onClose={() => {
              setIsOpen(false);
              setSelectedTemplateForEdit(null);
            }}
            refreshDocuments={fetchPrescriptions}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-[80%] mx-auto animate-in fade-in duration-300">
        <div className="flex flex-col gap-4">
          <Card className="border-none shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 text-primary">
                {mode === "prescriptions" ? (
                  <>
                    <Pill className="w-5 h-5" />
                    Gestion des Ordonnances & Bilans
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Gestion des Lettres
                  </>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {mode === "prescriptions"
                  ? `Gérez les prescriptions pour ${patient?.first_name} ${patient?.last_name}`
                  : `Gérez les lettres et documents pour ${patient?.first_name} ${patient?.last_name}`}
              </p>
            </CardHeader>
            <CardContent>
              {mode === "prescriptions" ? (
                <DocumentTypeSelector
                  allowedTypes={["PRESCRIPTION", "BLOOD_WORK"]}
                  onSelect={(type) => {
                    setIsOpen(true);
                    setDocType(type as any);
                    setViewingDocument(null);
                  }}
                />
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(true);
                    setDocType("TEMPLATE");
                    setViewingDocument(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Nouveau Document
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
          <div className="bg-muted/30 p-3 border-b flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="w-4 h-4" />
            {mode === "prescriptions"
              ? "Historique des ordonnances & bilans"
              : "Historique des lettres"}
          </div>

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
                <TableHead className="text-right">Options</TableHead>
              </TableRow>
            </TableHeader>

            {allItems.length === 0 ? (
              <TableBody>
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p>
                        Aucun(e){" "}
                        {mode === "prescriptions"
                          ? "ordonnance ou bilan"
                          : "lettre"}{" "}
                        pour le moment.
                      </p>
                      <p className="text-xs opacity-70">
                        Sélectionnez un type de{" "}
                        {mode === "prescriptions" ? "document" : "lettre"}{" "}
                        ci-dessus pour commencer.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {allItems
                  .slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE,
                  )
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
                        onView={(doc) => {
                          setViewingDocument(doc);
                          setDocType(null);
                          setIsOpen(true);
                        }}
                      />
                    ),
                  )}
              </TableBody>
            )}
          </Table>
        </div>
        <Pagination
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={allItems.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {(viewingDocument || docType === "TEMPLATE") && (
        <ModalV2
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setViewingDocument(null);
            setDocType(null);
          }}
          panelClassName="sm:max-w-4xl"
        >
          {viewingDocument ? (
            <SingleDocument
              document={viewingDocument}
              onClose={() => {
                setIsOpen(false);
                setViewingDocument(null);
              }}
            />
          ) : (
            patient && (
              <NewDocumentFromTemplate
                patient={patient}
                selectorOnly
                onTemplateSelect={(template) => {
                  setSelectedTemplateForEdit(template);
                  setDocType(null);
                  // Keep isOpen true so the full-page return triggers
                }}
                onClose={() => {
                  setIsOpen(false);
                  setDocType(null);
                }}
                refreshDocuments={fetchPrescriptions}
              />
            )
          )}
        </ModalV2>
      )}
    </>
  );
}

export default MainPrescriptionPage;
