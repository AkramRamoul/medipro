import { PrescriptionMed } from "../../../electron/schema";
import { smallPatient } from "../../type";
import PrintButton from "../PrintButton";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Pill, AlertCircle, User, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";

function SinglePrescription({
  onClose,
  meds,
  patient,
  isPsychotropic,
  psychotropicNumber,
  patientAddress,
  prescriptionDate,
  createdAt,
}: {
  onClose: () => void;
  meds: PrescriptionMed[];
  patient: smallPatient;
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
  prescriptionDate?: string | null;
  createdAt?: string | null;
}) {
  const formattedDate = prescriptionDate
    ? format(new Date(prescriptionDate), "dd MMMM yyyy", { locale: fr })
    : "Date non disponible";

  const formattedCreatedAt = createdAt
    ? format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
    : null;

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none h-full flex flex-col bg-transparent">
      <CardHeader className="border-b pb-4 px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                Ordonnance
                {isPsychotropic && (
                  <Badge variant="destructive" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Psychotrope
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4" />
                Prescrit le {formattedDate}
              </p>
            </div>
          </div>

          {isPsychotropic && psychotropicNumber && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl px-4 py-2 self-start sm:self-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Numéro: {psychotropicNumber}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Card */}
          <div className="lg:col-span-1 space-y-4 text-left">
            <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-[10px]">
                <User className="h-4 w-4" />
                <span>Patient</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {patient.first_name} {patient.last_name}
                </h3>
                <p className="text-sm text-muted-foreground font-semibold mt-0.5">
                  {(() => {
                    const dob = patient.dateOfBirth;
                    if (!dob) return 'N/A';
                    const birth = new Date(dob);
                    const today = new Date();
                    let age = today.getFullYear() - birth.getFullYear();
                    const m = today.getMonth() - birth.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                    return `${age} ans`;
                  })()}
                </p>
              </div>
              {patientAddress && (
                <div className="pt-4 border-t border-border flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/75" />
                  <p className="text-xs leading-relaxed font-medium">
                    {patientAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Medications List */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Médications prescrites
              </h4>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {meds.length} Médicament{meds.length !== 1 && "s"}
              </Badge>
            </div>

            {meds.length > 0 ? (
              <div className="space-y-4">
                {meds.map((med, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Subtly animated decorative glow using primary color instead of hardcoded blue */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                    <div className="flex flex-col gap-3 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {med.medicineName}
                          </h4>
                          {med.form && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold py-0 border-muted-foreground/20 text-muted-foreground bg-muted/30"
                            >
                              {med.form}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-2.5 mt-1">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Dosage
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {med.dosage}
                          </p>
                        </div>
                        {med.quantity && (
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              Quantité
                            </p>
                            <p className="text-xs font-semibold text-foreground">
                              {med.quantity}
                            </p>
                          </div>
                        )}
                        {med.duration && (
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              Durée
                            </p>
                            <p className="text-xs font-semibold text-foreground">
                              {med.duration}
                            </p>
                          </div>
                        )}
                      </div>

                      {med.note && (
                        <div className="mt-1 p-2.5 bg-primary/5 rounded-lg border-l-4 border-primary/50">
                          <p className="text-[9px] font-bold text-primary uppercase mb-0.5 tracking-wider">
                            Instructions
                          </p>
                          <p className="text-xs font-medium italic text-foreground/80 leading-relaxed">
                            &ldquo;{med.note}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border flex flex-col items-center gap-3 bg-muted/10">
                <Pill className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground font-semibold text-sm">
                  Aucun médicament prescrit.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-border/50 pt-6 mt-6 px-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {formattedCreatedAt && (
            <>
              <Clock className="h-3.5 w-3.5" />
              <span>Créé le {formattedCreatedAt}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6"
          >
            Fermer
          </Button>
          <PrintButton
            prescription={meds}
            patient={patient}
            isPsychotropic={isPsychotropic}
            psychotropicNumber={psychotropicNumber}
            patientAddress={patientAddress}
            prescriptionDate={prescriptionDate}
          />
        </div>
      </CardFooter>
    </Card>
  );
}

export default SinglePrescription;
