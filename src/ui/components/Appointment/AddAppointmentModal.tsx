import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Loader2, Calendar, Clock, FileText } from "lucide-react";
import api from "../../axios";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: string;
}

export function AddAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
}: AddAppointmentModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If no time is selected, we don't send a default "00:00" to avoid confusion in the UI
      const timePart = time || "";
      // If time is provided, we append it to the date; otherwise we just send the date
      const dateString = timePart ? `${date}T${timePart}` : date;

      await api.post("/appointments", {
        patientId: Number(patientId),
        title,
        date: dateString,
        time: timePart,
        notes,
        status: "scheduled",
      });

      onSuccess();
      onClose();
      setTitle("");
      setDate("");
      setTime("");
      setNotes("");
    } catch (error) {
      console.error("Failed to add appointment", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-b from-primary/10 to-transparent">
          <DialogTitle className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Nouveau Rendez-vous
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Planifiez une nouvelle consultation ou un suivi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre / Motif
            </Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Consultation de suivi"
                className="pl-9 bg-muted/30 border-input/50 focus:bg-background transition-all"
                required
              />
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9 bg-muted/30 border-input/50 focus:bg-background transition-all block"
                  required
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="time"
                className="text-sm font-medium flex justify-between"
              >
                Heure
                <span className="text-xs font-normal text-muted-foreground">
                  (Optionnel)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9 bg-muted/30 border-input/50 focus:bg-background transition-all block"
                />
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails supplémentaires..."
              className="resize-none min-h-[80px] bg-muted/30 border-input/50 focus:bg-background transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-muted/50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
