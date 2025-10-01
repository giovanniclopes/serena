import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  required?: boolean;
}

export default function DateTimeInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA HH:MM",
  className = "",
  style,
  required = false,
}: DateTimeInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Converter de ISO (YYYY-MM-DDTHH:MM) para DD/MM/YYYY HH:MM
  const formatToDisplay = (isoDateTime: string): string => {
    if (!isoDateTime) return "";
    const date = new Date(isoDateTime);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Converter de DD/MM/YYYY HH:MM para ISO (YYYY-MM-DDTHH:MM)
  const formatToISO = (displayDateTime: string): string => {
    if (!displayDateTime) return "";

    // Remover caracteres não numéricos exceto / e :
    const cleanDateTime = displayDateTime.replace(/[^\d/: ]/g, "");

    // Verificar se tem formato DD/MM/YYYY HH:MM
    const dateTimeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{1,2})$/;
    const match = cleanDateTime.match(dateTimeRegex);

    if (!match) return "";

    const [, day, month, year, hours, minutes] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    // Validar data e hora
    if (
      dayNum < 1 ||
      dayNum > 31 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < 1900 ||
      hoursNum < 0 ||
      hoursNum > 23 ||
      minutesNum < 0 ||
      minutesNum > 59
    ) {
      return "";
    }

    const date = new Date(yearNum, monthNum - 1, dayNum, hoursNum, minutesNum);
    if (
      date.getDate() !== dayNum ||
      date.getMonth() !== monthNum - 1 ||
      date.getFullYear() !== yearNum ||
      date.getHours() !== hoursNum ||
      date.getMinutes() !== minutesNum
    ) {
      return "";
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  // Atualizar display quando value prop muda
  useEffect(() => {
    setDisplayValue(formatToDisplay(value));
    setIsValid(true);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Se o input está vazio, limpar
    if (!inputValue) {
      onChange("");
      setIsValid(true);
      return;
    }

    // Se tem 16 caracteres (DD/MM/YYYY HH:MM), tentar converter
    if (inputValue.length === 16) {
      const isoDateTime = formatToISO(inputValue);
      if (isoDateTime) {
        onChange(isoDateTime);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir apenas números, /, :, espaço, backspace, delete, tab, enter, escape, setas
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (allowedKeys.includes(e.key)) return;

    // Permitir números, /, : e espaço
    if (!/[\d/: ]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    // Tentar converter data/hora colada
    const isoDateTime = formatToISO(pastedText);
    if (isoDateTime) {
      setDisplayValue(formatToDisplay(isoDateTime));
      onChange(isoDateTime);
      setIsValid(true);
    } else {
      // Se não conseguir converter, tentar como texto
      setDisplayValue(pastedText);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 pr-10 ${
          !isValid ? "border-red-500" : ""
        } ${className}`}
        style={style}
        required={required}
        maxLength={16}
      />
      <Calendar
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: style?.color || "#6B7280" }}
      />
      {!isValid && (
        <div className="text-red-500 text-xs mt-1">
          Data/hora inválida. Use o formato DD/MM/AAAA HH:MM
        </div>
      )}
    </div>
  );
}
