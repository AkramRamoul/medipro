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
}: {
  onClose: () => void;
  meds: PrescriptionMed[];
  patient: smallPatient;
  isPsychotropic?: boolean;
  psychotropicNumber?: number | null;
  patientAddress?: string | null;
  prescriptionDate?: string | null;
}) {
  const formattedDate = prescriptionDate
    ? format(new Date(prescriptionDate), "dd MMMM yyyy", { locale: fr })
    : "Date non disponible";
  const formattedTime = prescriptionDate
    ? format(new Date(prescriptionDate), "HH:mm")
    : "--:--";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="p-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Ordonnance
                </CardTitle>
                <div className="flex items-center gap-3 mt-1.5 text-blue-100/90 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formattedDate}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-blue-200/50" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formattedTime}
                  </div>
                </div>
              </div>
            </div>

            {isPsychotropic && (
              <Badge
                variant="destructive"
                className="relative z-10 self-start md:self-center px-4 py-2 text-sm font-bold bg-white text-red-600 hover:bg-white border-none shadow-lg shadow-black/10"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                PSYCHOTROPE #{psychotropicNumber}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-muted/40 dark:bg-muted/10 border border-border/50 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Patient
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    {patient.age} ans
                  </p>
                </div>
                {patientAddress && (
                  <div className="pt-4 border-t border-border/40">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-balance leading-relaxed text-muted-foreground font-medium">
                        {patientAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medications List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Médications
                  <Badge
                    variant="secondary"
                    className="rounded-md px-2 py-0 h-5 font-bold"
                  >
                    {meds.length}
                  </Badge>
                </h3>
              </div>

              {meds.length > 0 ? (
                <div className="space-y-4">
                  {meds.map((med, index) => (
                    <div
                      key={index}
                      className="group p-5 rounded-3xl border border-border/60 bg-card hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />

                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {med.medicineName}
                            </h4>
                            {med.form && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold uppercase tracking-tight py-0 border-muted-foreground/30"
                              >
                                {med.form}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Dosage
                            </p>
                            <p className="text-sm font-semibold">
                              {med.dosage}
                            </p>
                          </div>
                          {med.quantity && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Quantité
                              </p>
                              <p className="text-sm font-semibold">
                                {med.quantity}
                              </p>
                            </div>
                          )}
                          {med.duration && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Durée
                              </p>
                              <p className="text-sm font-semibold">
                                {med.duration}
                              </p>
                            </div>
                          )}
                        </div>

                        {med.note && (
                          <div className="mt-1 p-3.5 bg-muted/30 dark:bg-muted/10 rounded-2xl border-l-4 border-blue-500/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-wider">
                              Instructions spéciales
                            </p>
                            <p className="text-sm font-medium italic text-muted-foreground leading-relaxed">
                              &ldquo;{med.note}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-3xl border border-dashed border-border flex flex-col items-center gap-3 bg-muted/10">
                  <Pill className="h-12 w-12 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-semibold">
                    Aucun médicament prescrit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end items-center gap-3 mt-8 pt-8 border-t border-border/50 p-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-2xl px-6 h-12 font-bold hover:bg-muted"
          >
            Annuler
          </Button>
          <PrintButton
            prescription={meds}
            patient={patient}
            window={window}
            isPsychotropic={isPsychotropic}
            psychotropicNumber={psychotropicNumber}
            patientAddress={patientAddress}
            prescriptionDate={prescriptionDate}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

export default SinglePrescription;
