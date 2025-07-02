import React, { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subHours } from "date-fns";
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
    from: subDays(new Date(), 6), // Default to last 7 days
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
        range = { from: subHours(today, 24), to: today }; // Last 24 hours
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

  // Helper to check if a preset is active - will need to be adjusted for 24-hour yesterday
  const isPresetActive = (key: string) => {
    const today = new Date();
    // Normalize dates for comparison to ignore time for full day presets, but consider it for 'yesterday' 24h
    const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    switch (key) {
      case "today":
        return normalizeDate(date.from).getTime() === normalizeDate(today).getTime() && normalizeDate(date.to).getTime() === normalizeDate(today).getTime();
      case "yesterday":
        // For 24-hour yesterday, check if the range exactly matches subHours(today, 24) to today
        return date.from.getTime() === subHours(today, 24).getTime() && date.to.getTime() === today.getTime();
      case "last7days":
        return normalizeDate(date.from).getTime() === normalizeDate(subDays(today, 6)).getTime() && normalizeDate(date.to).getTime() === normalizeDate(today).getTime();
      case "last30days":
        return normalizeDate(date.from).getTime() === normalizeDate(subDays(today, 29)).getTime() && normalizeDate(date.to).getTime() === normalizeDate(today).getTime();
      case "thisMonth":
        return normalizeDate(date.from).getTime() === normalizeDate(startOfMonth(today)).getTime() && normalizeDate(date.to).getTime() === normalizeDate(endOfMonth(today)).getTime();
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        return normalizeDate(date.from).getTime() === normalizeDate(startOfMonth(lastMonth)).getTime() && normalizeDate(date.to).getTime() === normalizeDate(endOfMonth(lastMonth)).getTime();
      case "thisYear":
        return normalizeDate(date.from).getTime() === normalizeDate(startOfYear(today)).getTime() && normalizeDate(date.to).getTime() === normalizeDate(endOfYear(today)).getTime();
      default:
        return false;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-sm font-semibold text-muted-foreground">Филтрирај по датум</div>
      {/* Wrap filter buttons on mobile, grid on desktop */}
      <div className="flex flex-wrap gap-2 pb-2 md:grid md:grid-cols-4 md:overflow-visible md:gap-3">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            variant={isPresetActive(preset.key) ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
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
              className="flex items-center gap-2"
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