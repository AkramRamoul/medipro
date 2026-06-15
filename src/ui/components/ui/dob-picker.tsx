import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "../../lib/utils";

interface DOBPickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

const months = [
  { value: "0", label: "Janvier" },
  { value: "1", label: "Février" },
  { value: "2", label: "Mars" },
  { value: "3", label: "Avril" },
  { value: "4", label: "Mai" },
  { value: "5", label: "Juin" },
  { value: "6", label: "Juillet" },
  { value: "7", label: "Août" },
  { value: "8", label: "Septembre" },
  { value: "9", label: "Octobre" },
  { value: "10", label: "Novembre" },
  { value: "11", label: "Décembre" },
];

const getDaysInMonth = (monthStr: string, yearStr: string) => {
  const m = monthStr !== "" ? parseInt(monthStr, 10) : 0; // Default to Jan (0)
  const y = yearStr !== "" ? parseInt(yearStr, 10) : 2000; // Default to leap year

  if (m === 1) { // February
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    return isLeap ? 29 : 28;
  }
  if ([3, 5, 8, 10].includes(m)) { // April, June, September, November
    return 30;
  }
  return 31;
};

export function DOBPicker({ value, onChange, className }: DOBPickerProps) {
  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

  const lastSyncedValueRef = React.useRef<Date | undefined>(undefined);

  React.useEffect(() => {
    const valTime = value?.getTime();
    const lastSyncedTime = lastSyncedValueRef.current?.getTime();

    if (valTime !== lastSyncedTime) {
      if (value) {
        setDay(value.getDate().toString());
        setMonth(value.getMonth().toString());
        setYear(value.getFullYear().toString());
      } else {
        setDay("");
        setMonth("");
        setYear("");
      }
      lastSyncedValueRef.current = value;
    }
  }, [value]);

  const handleSelectChange = (type: "day" | "month" | "year", newVal: string) => {
    let newDay = day;
    let newMonth = month;
    let newYear = year;

    if (type === "day") {
      newDay = newVal;
      setDay(newVal);
    }
    if (type === "month") {
      newMonth = newVal;
      setMonth(newVal);
    }
    if (type === "year") {
      newYear = newVal;
      setYear(newVal);
    }

    if (newDay && newMonth !== "" && newYear) {
      const d = parseInt(newDay, 10);
      const m = parseInt(newMonth, 10);
      const y = parseInt(newYear, 10);

      // Validate day fits in the selected month/year
      const maxDays = getDaysInMonth(newMonth, newYear);
      const adjustedDay = d > maxDays ? maxDays : d;

      if (adjustedDay !== d) {
        setDay(adjustedDay.toString());
      }

      const newDate = new Date(y, m, adjustedDay);
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  // Adjust days list dynamically based on the currently selected month and year
  const maxDays = getDaysInMonth(month, year);
  const days = Array.from({ length: maxDays }, (_, i) => (i + 1).toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {/* Day Select */}
      <Select
        value={day}
        onValueChange={(val) => handleSelectChange("day", val)}
      >
        <SelectTrigger className="bg-background text-foreground">
          <SelectValue placeholder="Jour" />
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground">
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Select */}
      <Select
        value={month}
        onValueChange={(val) => handleSelectChange("month", val)}
      >
        <SelectTrigger className="bg-background text-foreground">
          <SelectValue placeholder="Mois" />
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground">
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Select */}
      <Select
        value={year}
        onValueChange={(val) => handleSelectChange("year", val)}
      >
        <SelectTrigger className="bg-background text-foreground">
          <SelectValue placeholder="Année" />
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground">
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
