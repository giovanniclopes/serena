import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { createBrazilDateTime } from "../lib/dayjs";
import type { Recurrence, RecurrenceEndType, RecurrenceType } from "../types";
import { getRecurrenceDescription } from "../utils/recurrenceUtils";
import DateTimeInput from "./DateTimeInput";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface RecurrenceManagerProps {
  recurrence?: Recurrence;
  onRecurrenceChange: (recurrence: Recurrence | undefined) => void;
}

const recurrenceTypes: { value: RecurrenceType; label: string }[] = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
  { value: "custom", label: "Personalizado" },
];

const endTypes: { value: RecurrenceEndType; label: string }[] = [
  { value: "never", label: "Nunca" },
  { value: "date", label: "Até uma data" },
  { value: "count", label: "Após X ocorrências" },
];

const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export default function RecurrenceManager({
  recurrence,
  onRecurrenceChange,
}: RecurrenceManagerProps) {
  const { state } = useApp();
  const [isEnabled, setIsEnabled] = useState(!!recurrence);

  const [formData, setFormData] = useState<Recurrence>({
    type: recurrence?.type || "daily",
    interval: recurrence?.interval || 1,
    daysOfWeek: recurrence?.daysOfWeek || [],
    dayOfMonth: recurrence?.dayOfMonth || 1,
    endType: recurrence?.endType || "never",
    endDate: recurrence?.endDate ? new Date(recurrence.endDate) : undefined,
    endCount: recurrence?.endCount || 1,
  });

  useEffect(() => {
    if (recurrence) {
      setFormData({
        type: recurrence.type || "daily",
        interval: recurrence.interval || 1,
        daysOfWeek: recurrence.daysOfWeek || [],
        dayOfMonth: recurrence.dayOfMonth || 1,
        endType: recurrence.endType || "never",
        endDate: recurrence.endDate ? new Date(recurrence.endDate) : undefined,
        endCount: recurrence.endCount || 1,
      });
      setIsEnabled(true);
    } else {
      setFormData({
        type: "daily",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: 1,
        endType: "never",
        endDate: undefined,
        endCount: 1,
      });
      setIsEnabled(false);
    }
  }, [recurrence]);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onRecurrenceChange(undefined);
    } else {
      onRecurrenceChange(formData);
    }
  };

  const handleChange = (field: keyof Recurrence, value: unknown) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onRecurrenceChange(newFormData);
  };

  const handleDayToggle = (day: number) => {
    const newDays = formData.daysOfWeek?.includes(day)
      ? formData.daysOfWeek.filter((d) => d !== day)
      : [...(formData.daysOfWeek || []), day];
    handleChange("daysOfWeek", newDays);
  };

  const getEndDateValue = () => {
    if (!formData.endDate) return "";
    if (formData.endDate instanceof Date) {
      return formData.endDate.toISOString().slice(0, 16);
    }
    try {
      const date = new Date(formData.endDate);
      return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const getDescription = () => {
    if (!isEnabled) return "Não repetir";
    return getRecurrenceDescription(formData);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label
          className="text-sm font-medium"
          style={{ color: state.currentTheme.colors.text }}
        >
          Repetir tarefa
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleToggle(!isEnabled)}
          className="text-xs"
        >
          {isEnabled ? "Desativar" : "Ativar"}
        </Button>
      </div>

      {isEnabled && (
        <Card
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Tipo de repetição
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Intervalo
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(e) =>
                    handleChange("interval", parseInt(e.target.value) || 1)
                  }
                  className="text-sm"
                />
              </div>
            </div>

            {formData.type === "weekly" && (
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Dias da semana
                </Label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={
                        formData.daysOfWeek?.includes(day.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleDayToggle(day.value)}
                      className="text-xs"
                    >
                      {day.label.charAt(0)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {formData.type === "monthly" && (
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Dia do mês
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth || 1}
                  onChange={(e) =>
                    handleChange("dayOfMonth", parseInt(e.target.value) || 1)
                  }
                  className="text-sm"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium mb-2 block">
                Terminar repetição
              </Label>
              <Select
                value={formData.endType}
                onValueChange={(value) => handleChange("endType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {endTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.endType === "date" && (
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Data final
                </Label>
                <DateTimeInput
                  value={getEndDateValue()}
                  onChange={(value) => {
                    if (value) {
                      const date = new Date(value);
                      const year = date.getFullYear();
                      const month = date.getMonth();
                      const day = date.getDate();
                      const hours = date.getHours();
                      const minutes = date.getMinutes();
                      const brazilDateTime = createBrazilDateTime(
                        new Date(year, month, day),
                        hours,
                        minutes
                      );
                      handleChange("endDate", brazilDateTime);
                    } else {
                      handleChange("endDate", undefined);
                    }
                  }}
                  placeholder="DD/MM/AAAA HH:MM"
                  className="w-full"
                />
              </div>
            )}

            {formData.endType === "count" && (
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Número de ocorrências
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.endCount || 1}
                  onChange={(e) =>
                    handleChange("endCount", parseInt(e.target.value) || 1)
                  }
                  className="text-sm"
                />
              </div>
            )}

            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "10",
                borderColor: state.currentTheme.colors.primary + "30",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              <div className="flex items-center space-x-2">
                <Clock
                  className="w-4 h-4"
                  style={{ color: state.currentTheme.colors.primary }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {getDescription()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
