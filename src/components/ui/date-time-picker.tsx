"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
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
    value ? format(value, "HH:mm") : ""
  );

  React.useEffect(() => {
    setSelectedDate(value);
    setTimeValue(value ? format(value, "HH:mm") : "");
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes);
      onChange?.(newDateTime);
    } else if (date) {
      onChange?.(date);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes);
      onChange?.(newDateTime);
    }
  };

  return (
    <div className="space-y-2">
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
              format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
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
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <div className="relative">
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
          placeholder="HH:MM"
          className="w-full"
          disabled={disabled}
        />
        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
