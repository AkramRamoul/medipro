import { useCallback, useEffect, useMemo, useState } from "react";
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
import { BloodWork } from "../Documents/BloodWork";
import DocumentRow from "../Documents/DocumentRow";
import { SingleDocument } from "../Documents/SingleDocument";
import NewDocumentFromTemplate from "../Documents/NewDocumentFromTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pill, FileText, Clock, Calendar } from "lucide-react";
import ModalV2 from "../Modalsecond";
import Pagination from "../Pagination";
import { Button } from "../ui/button";
import api from "../../axios";

const ITEMS_PER_PAGE = 8;

function MainPrescriptionPage({
  id,
  mode = "prescriptions",
}: {
  id: string;
  mode?: "prescriptions" | "letters" | "bilans";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState<
    null | "PRESCRIPTION" | "BLOOD_WORK" | "CERTIFICATE" | "REPORT" | "TEMPLATE"
  >(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [presPage, setPresPage] = useState(1);
  const [bilanPage, setBilanPage] = useState(1);

  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any | null
  >(null);

  const [patient, setPatient] = useState<Patient | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const { data: presData } = await api.get(`/prescriptions/patient/${id}`);
      setPrescriptions(presData);
      const { data: docData } = await api.get(`/documents/patient/${id}`);
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
      api.get(`/patients/${id}`)
        .then(({ data }) => {
          setPatient(data);
        })
        .catch((error: Error) =>
          console.error("Error fetching patient:", error),
        );
    }
  }, [id]);

  // Derived lists for stacked view
  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [prescriptions]);

  const sortedBilans = useMemo(() => {
    return documents
      .filter((d) => d.type === "blood")
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [documents]);

  const allItems = useCallback(() => {
    const base = documents
      .filter((d) => d.type !== "blood")
      .map((d) => ({ ...d, kind: "document" as const }));

    return base.sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const dateA = getTime(a.createdAt);
      const dateB = getTime(b.createdAt);
      return dateB - dateA;
    });
  }, [documents])();

  // --- letters template edit screen redirection ---
  if (
    isOpen &&
    !viewingDocument &&
    selectedTemplateForEdit
  ) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
      <div className="space-y-6 w-full animate-in fade-in duration-300">

        {/* ── Prescriptions mode: Stacked cards with direct history and creation buttons ── */}
        {mode === "prescriptions" && (
          <div className="space-y-8">
            {/* Ordonnances Card */}
            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-primary font-bold">
                    <Pill className="w-5 h-5" />
                    Ordonnances
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Historique de toutes les prescriptions rédigées pour ce patient.
                  </p>
                </div>
                {patient && (
                  <Button
                    onClick={() => {
                      setDocType("PRESCRIPTION");
                      setIsOpen(true);
                    }}
                    className="flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Pill className="w-4 h-4" />
                    Nouvelle Ordonnance
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="border rounded-lg overflow-hidden bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[25%]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Date
                          </div>
                        </TableHead>
                        <TableHead>Médicaments prescrit</TableHead>
                        <TableHead className="hidden md:table-cell w-[20%]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Heure
                          </div>
                        </TableHead>
                        <TableHead className="text-right w-[20%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPrescriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2 py-4">
                              <Pill className="w-8 h-8 opacity-20" />
                              <p className="font-medium text-sm">Aucune ordonnance rédigée pour le moment.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedPrescriptions
                          .slice((presPage - 1) * ITEMS_PER_PAGE, presPage * ITEMS_PER_PAGE)
                          .map((item, index) => (
                            <PrescriptionRow
                              key={`pres-${index}`}
                              prescription={item}
                              setData={setPrescriptions}
                              patinet={patient!}
                            />
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {sortedPrescriptions.length > ITEMS_PER_PAGE && (
                  <Pagination
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={sortedPrescriptions.length}
                    currentPage={presPage}
                    onPageChange={setPresPage}
                  />
                )}
              </CardContent>
            </Card>

            {/* Bilans Card */}
            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-600 font-bold">
                    <FileText className="w-5 h-5" />
                    Bilans Sanguins
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Historique des bilans prescrits et demandes d'analyses de sang.
                  </p>
                </div>
                {patient && (
                  <Button
                    onClick={() => {
                      setDocType("BLOOD_WORK");
                      setIsOpen(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50/50 hover:border-blue-400 self-start sm:self-auto"
                  >
                    <FileText className="w-4 h-4" />
                    Nouveau Bilan
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="border rounded-lg overflow-hidden bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[25%]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Date
                          </div>
                        </TableHead>
                        <TableHead>Analyses demandées</TableHead>
                        <TableHead className="hidden md:table-cell w-[20%]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Heure
                          </div>
                        </TableHead>
                        <TableHead className="text-right w-[20%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedBilans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2 py-4">
                              <FileText className="w-8 h-8 opacity-20" />
                              <p className="font-medium text-sm">Aucun bilan demandé pour le moment.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedBilans
                          .slice((bilanPage - 1) * ITEMS_PER_PAGE, bilanPage * ITEMS_PER_PAGE)
                          .map((item, index) => (
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
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {sortedBilans.length > ITEMS_PER_PAGE && (
                  <Pagination
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={sortedBilans.length}
                    currentPage={bilanPage}
                    onPageChange={setBilanPage}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Letters mode: single card ── */}
        {mode === "letters" && (
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2 text-primary font-bold">
                  <FileText className="w-5 h-5" />
                  Gestion des Lettres
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gérez les lettres d'orientation et rapports pour {patient?.first_name} {patient?.last_name}.
                </p>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
              <div className="bg-muted/30 p-3 border-b flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="w-4 h-4" />
                Historique des lettres
              </div>

              <Table>
                <TableHeader>
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
                <TableBody>
                  {allItems.length === 0 ? (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 opacity-20" />
                          <p>Aucune lettre enregistrée pour le moment.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allItems
                      .slice(
                        (currentPage - 1) * ITEMS_PER_PAGE,
                        currentPage * ITEMS_PER_PAGE,
                      )
                      .map((item, index) => (
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
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
            {allItems.length > ITEMS_PER_PAGE && (
              <Pagination
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={allItems.length}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>

      {(viewingDocument || docType) && (
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
              patient={patient || undefined}
              onClose={() => {
                setIsOpen(false);
                setViewingDocument(null);
              }}
            />
          ) : docType === "PRESCRIPTION" && patient ? (
            <div className="p-6">
              <NewPrescriptionForm
                id={id}
                onClose={() => {
                  setIsOpen(false);
                  setDocType(null);
                }}
                refreshPrescriptions={fetchPrescriptions}
                patient={patient}
              />
            </div>
          ) : docType === "BLOOD_WORK" && patient ? (
            <div className="p-6">
              <BloodWork
                patient={patient}
                onClose={() => {
                  setIsOpen(false);
                  setDocType(null);
                }}
                refreshDocuments={fetchPrescriptions}
              />
            </div>
          ) : docType === "TEMPLATE" && patient ? (
            <NewDocumentFromTemplate
              patient={patient}
              selectorOnly
              onTemplateSelect={(template) => {
                setSelectedTemplateForEdit(template);
                setDocType(null);
              }}
              onClose={() => {
                setIsOpen(false);
                setDocType(null);
              }}
              refreshDocuments={fetchPrescriptions}
            />
          ) : null}
        </ModalV2>
      )}
    </>
  );
}

export default MainPrescriptionPage;
