import React, { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import { mk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange as CalendarDateRange } from "react-day-picker";

export type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void;
  className?: string;
}

const presets = [
  { key: "today", label: "Денес" },
  { key: "yesterday", label: "Вчера" },
  { key: "last7days", label: "Последни 7 Дена" },
  { key: "last30days", label: "Последни 30 Дена" },
  { key: "thisMonth", label: "Овој Месец" },
  { key: "lastMonth", label: "Претходен Месец" },
  { key: "thisYear", label: "Оваа Година" },
];

const DateRangeSelector = ({ onRangeChange, className }: DateRangeSelectorProps) => {
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);

  const handlePresetSelect = (preset: string) => {
    const today = new Date();
    let range: DateRange;

    switch (preset) {
      case "today":
        range = { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        range = { from: yesterday, to: yesterday };
        break;
      case "last7days":
        range = { from: subDays(today, 6), to: today };
        break;
      case "last30days":
        range = { from: subDays(today, 29), to: today };
        break;
      case "thisMonth":
        range = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        break;
      case "thisYear":
        range = { from: startOfYear(today), to: endOfYear(today) };
        break;
      default:
        return;
    }

    setDate(range);
    onRangeChange(range);
  };

  const handleCustomRangeSelect = (range: CalendarDateRange | undefined) => {
    if (range?.from && range?.to) {
      const newRange: DateRange = {
        from: range.from,
        to: range.to,
      };
      setDate(newRange);
      onRangeChange(newRange);
      setIsCustomRangeOpen(false);
    }
  };

  // Helper to check if a preset is active
  const isPresetActive = (key: string) => {
    const today = new Date();
    switch (key) {
      case "today":
        return date.from.getTime() === date.to.getTime() && date.from.getTime() === today.getTime();
      case "yesterday":
        return date.from.getTime() === date.to.getTime() && date.from.getTime() === subDays(today, 1).getTime();
      case "last7days":
        return date.from.getTime() === subDays(today, 6).getTime() && date.to.getTime() === today.getTime();
      case "last30days":
        return date.from.getTime() === subDays(today, 29).getTime() && date.to.getTime() === today.getTime();
      case "thisMonth":
        return date.from.getTime() === startOfMonth(today).getTime() && date.to.getTime() === endOfMonth(today).getTime();
      case "lastMonth":
        return date.from.getTime() === startOfMonth(subMonths(today, 1)).getTime() && date.to.getTime() === endOfMonth(subMonths(today, 1)).getTime();
      case "thisYear":
        return date.from.getTime() === startOfYear(today).getTime() && date.to.getTime() === endOfYear(today).getTime();
      default:
        return false;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-sm font-semibold text-muted-foreground">Филтрирај по датум</div>
      {/* Horizontal scrollable row on mobile, row/grid on desktop */}
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2 md:grid md:grid-cols-4 md:overflow-visible md:gap-3 md:px-0">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            variant={isPresetActive(preset.key) ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap flex-shrink-0"
            onClick={() => handlePresetSelect(preset.key)}
          >
            {preset.label}
          </Button>
        ))}
        {/* Custom date picker button at the end */}
        <Popover open={isCustomRangeOpen} onOpenChange={setIsCustomRangeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={presets.every(p => !isPresetActive(p.key)) ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <CalendarIcon className="h-4 w-4" />
              {date.from && date.to ? (
                <>
                  {format(date.from, "dd MMM yyyy", { locale: mk })} -{" "}
                  {format(date.to, "dd MMM yyyy", { locale: mk })}
                </>
              ) : (
                "Избери датуми"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={date}
              onSelect={handleCustomRangeSelect}
              numberOfMonths={2}
              locale={mk}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeSelector; 