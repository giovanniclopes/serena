"use client";

import {
  createBrazilDateTime,
  formatBrazilDate,
  formatBrazilTime,
} from "@/lib/dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  required?: boolean;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  style,
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value
  );
  const [timeValue, setTimeValue] = React.useState(
    value ? formatBrazilTime(value) : ""
  );

  React.useEffect(() => {
    setSelectedDate(value);
    setTimeValue(value ? formatBrazilTime(value) : "");
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDateTime = createBrazilDateTime(date, hours, minutes);
      onChange?.(newDateTime);
    } else if (date) {
      onChange?.(date);
    }
  };

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);

    if (time && validateTime(time) && selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDateTime = createBrazilDateTime(selectedDate, hours, minutes);
      onChange?.(newDateTime);
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const value = input.value;

    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      return;
    }

    if (!/\d|:/.test(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === ":" && value.includes(":")) {
      e.preventDefault();
      return;
    }

    if (/\d/.test(e.key) && value.length === 1 && !value.includes(":")) {
      setTimeout(() => {
        const newValue = input.value;
        if (newValue.length === 2 && !newValue.includes(":")) {
          const formattedValue = newValue + ":";
          input.value = formattedValue;
          handleTimeChange(formattedValue);
          input.setSelectionRange(3, 3);
        }
      }, 0);
    }
  };

  const handleTimeBlur = () => {
    if (timeValue && !validateTime(timeValue)) {
      if (/^\d{1,4}$/.test(timeValue)) {
        const digits = timeValue.padStart(4, "0");
        const hours = digits.substring(0, 2);
        const minutes = digits.substring(2, 4);

        const h = parseInt(hours);
        const m = parseInt(minutes);

        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const formattedTime = `${hours}:${minutes}`;
          setTimeValue(formattedTime);

          if (selectedDate) {
            const newDateTime = createBrazilDateTime(selectedDate, h, m);
            onChange?.(newDateTime);
          }
          return;
        }
      }

      setTimeValue("");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              className
            )}
            style={style}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              formatBrazilDate(selectedDate)
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Input
        type="text"
        value={timeValue}
        onChange={(e) => handleTimeChange(e.target.value)}
        onKeyDown={handleTimeKeyDown}
        onFocus={() => {}}
        onBlur={handleTimeBlur}
        placeholder="--:--"
        className="w-full"
        disabled={disabled}
        maxLength={5}
        title="Formato: HH:MM (24 horas)"
      />
    </div>
  );
}
