"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";

function label(range?: DateRange) {
  if (!range?.from) {
    return "Choose your dates";
  }
  if (!range.to) {
    return `${formatDate(range.from)} — pick a return date`;
  }
  return `${formatDate(range.from)} — ${formatDate(range.to)}`;
}

export function DateRangePicker({
  value,
  onChange,
  invalid = false,
  disabled = false,
}: {
  value?: DateRange;
  onChange: (range?: DateRange) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            "w-full justify-start font-normal",
            !value?.from && "text-muted-foreground",
          )}
        >
          <CalendarDays />
          {label(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          autoFocus
          defaultMonth={value?.from ?? today}
          selected={value}
          onSelect={(range) => {
            onChange(range);
            if (range?.from && range.to) {
              setOpen(false);
            }
          }}
          disabled={{ before: today }}
          numberOfMonths={2}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
