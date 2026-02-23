import { Consultation } from "../../type";
import { Calendar, FileText, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { VITALS_CONFIG } from "../../lib/vitals-config";

interface ConsultationCardProps {
    consultation: Consultation;
    onClick: () => void;
    onDelete: () => void;
}

// Color mapping for common diagnosis types
function getDiagnosisStyle(diagnosis: string): { bg: string; text: string } {
    const lowerDiag = diagnosis.toLowerCase();

    // Urgent/Critical conditions
    if (lowerDiag.includes("urgent") || lowerDiag.includes("critique") || lowerDiag.includes("aigu")) {
        return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" };
    }
    // Chronic conditions
    if (lowerDiag.includes("chronique") || lowerDiag.includes("hypertension") || lowerDiag.includes("diabète")) {
        return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" };
    }
    // Infections
    if (lowerDiag.includes("infection") || lowerDiag.includes("grippe") || lowerDiag.includes("angine")) {
        return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" };
    }
    // Follow-up / Control
    if (lowerDiag.includes("contrôle") || lowerDiag.includes("suivi") || lowerDiag.includes("bilan")) {
        return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" };
    }
    // Default - clinical blue
    return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" };
}

export function ConsultationCard({ consultation, onClick, onDelete }: ConsultationCardProps) {
    const diagStyle = consultation.diagnosis ? getDiagnosisStyle(consultation.diagnosis) : null;

    const hasVitals = consultation.bloodPressure || consultation.weight;
    const formattedDate = new Date(consultation.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div
            onClick={onClick}
            className="group relative p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
            {/* Header: Date and Actions */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">{formattedDate}</span>
                    {consultation.status && (
                        <Badge variant={consultation.status === 'completed' ? 'secondary' : 'outline'} className={`ml-2 text-[10px] px-1.5 py-0 ${consultation.status === 'in_progress' ? "animate-pulse border-blue-500 text-blue-500" : ""
                            }`}>
                            {consultation.status === 'completed' ? 'Terminée' : 'En cours'}
                        </Badge>
                    )}
                </div>

                <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette consultation ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. La consultation sera définitivement supprimée.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Reason */}
            <div className="mb-3">
                <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="font-medium text-foreground line-clamp-2">
                        {consultation.reason || (
                            <span className="text-muted-foreground italic">Motif non spécifié</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Diagnosis Tag */}
            {consultation.diagnosis && diagStyle && (
                <div className="mb-3">
                    <Badge
                        variant="secondary"
                        className={`${diagStyle.bg} ${diagStyle.text} border-0 font-medium`}
                    >
                        {consultation.diagnosis}
                    </Badge>
                </div>
            )}

            {/* Vitals Strip */}
            {hasVitals && (() => {
                const BPIcon = VITALS_CONFIG.bloodPressure.icon;
                const WeightIcon = VITALS_CONFIG.weight.icon;
                const bpConfig = VITALS_CONFIG.bloodPressure;
                const weightConfig = VITALS_CONFIG.weight;

                return (
                    <div className="flex items-center gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        {consultation.bloodPressure && (
                            <div className="flex items-center gap-1.5">
                                <BPIcon className={`h-3 w-3 ${bpConfig.tailwind.text}`} />
                                <span>{consultation.bloodPressure} {bpConfig.unit}</span>
                            </div>
                        )}
                        {consultation.weight && (
                            <div className="flex items-center gap-1.5">
                                <WeightIcon className={`h-3 w-3 ${weightConfig.tailwind.text}`} />
                                <span>{consultation.weight} {weightConfig.unit}</span>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Payment indicator */}
            {consultation.amountPaid && consultation.amountPaid > 0 && (
                <div className="absolute bottom-2 right-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                        {consultation.amountPaid} DA
                    </span>
                </div>
            )}
        </div>
    );
}
