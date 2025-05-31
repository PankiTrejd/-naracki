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

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={date.from.getTime() === date.to.getTime() && date.from.getTime() === new Date().getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("today")}
      >
        Денес
      </Button>
      <Button
        variant={date.from.getTime() === date.to.getTime() && date.from.getTime() === subDays(new Date(), 1).getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("yesterday")}
      >
        Вчера
      </Button>
      <Button
        variant={date.from.getTime() === subDays(new Date(), 6).getTime() && date.to.getTime() === new Date().getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("last7days")}
      >
        Последни 7 Дена
      </Button>
      <Button
        variant={date.from.getTime() === subDays(new Date(), 29).getTime() && date.to.getTime() === new Date().getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("last30days")}
      >
        Последни 30 Дена
      </Button>
      <Button
        variant={date.from.getTime() === startOfMonth(new Date()).getTime() && date.to.getTime() === endOfMonth(new Date()).getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("thisMonth")}
      >
        Овој Месец
      </Button>
      <Button
        variant={date.from.getTime() === startOfMonth(subMonths(new Date(), 1)).getTime() && date.to.getTime() === endOfMonth(subMonths(new Date(), 1)).getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("lastMonth")}
      >
        Претходен Месец
      </Button>
      <Button
        variant={date.from.getTime() === startOfYear(new Date()).getTime() && date.to.getTime() === endOfYear(new Date()).getTime() ? "default" : "outline"}
        size="sm"
        onClick={() => handlePresetSelect("thisYear")}
      >
        Оваа Година
      </Button>
      <Popover open={isCustomRangeOpen} onOpenChange={setIsCustomRangeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={!Object.values({
              today: date.from.getTime() === date.to.getTime() && date.from.getTime() === new Date().getTime(),
              yesterday: date.from.getTime() === date.to.getTime() && date.from.getTime() === subDays(new Date(), 1).getTime(),
              last7days: date.from.getTime() === subDays(new Date(), 6).getTime() && date.to.getTime() === new Date().getTime(),
              last30days: date.from.getTime() === subDays(new Date(), 29).getTime() && date.to.getTime() === new Date().getTime(),
              thisMonth: date.from.getTime() === startOfMonth(new Date()).getTime() && date.to.getTime() === endOfMonth(new Date()).getTime(),
              lastMonth: date.from.getTime() === startOfMonth(subMonths(new Date(), 1)).getTime() && date.to.getTime() === endOfMonth(subMonths(new Date(), 1)).getTime(),
              thisYear: date.from.getTime() === startOfYear(new Date()).getTime() && date.to.getTime() === endOfYear(new Date()).getTime(),
            }).some(Boolean) ? "default" : "outline"}
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
  );
};

export default DateRangeSelector; 