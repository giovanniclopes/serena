import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  required?: boolean;
}

export default function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  className = "",
  style,
  required = false,
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Converter de ISO (YYYY-MM-DD) para DD/MM/YYYY
  const formatToDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate + "T00:00:00");
    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Converter de DD/MM/YYYY para ISO (YYYY-MM-DD)
  const formatToISO = (displayDate: string): string => {
    if (!displayDate) return "";

    // Remover caracteres não numéricos exceto /
    const cleanDate = displayDate.replace(/[^\d/]/g, "");

    // Verificar se tem formato DD/MM/YYYY
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = cleanDate.match(dateRegex);

    if (!match) return "";

    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Validar data
    if (
      dayNum < 1 ||
      dayNum > 31 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < 1900
    ) {
      return "";
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (
      date.getDate() !== dayNum ||
      date.getMonth() !== monthNum - 1 ||
      date.getFullYear() !== yearNum
    ) {
      return "";
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

    // Se tem 10 caracteres (DD/MM/YYYY), tentar converter
    if (inputValue.length === 10) {
      const isoDate = formatToISO(inputValue);
      if (isoDate) {
        onChange(isoDate);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir apenas números, /, backspace, delete, tab, enter, escape, setas
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

    // Permitir números e /
    if (!/[\d/]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    // Tentar converter data colada
    const isoDate = formatToISO(pastedText);
    if (isoDate) {
      setDisplayValue(formatToDisplay(isoDate));
      onChange(isoDate);
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
        maxLength={10}
      />
      <Calendar
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: style?.color || "#6B7280" }}
      />
      {!isValid && (
        <div className="text-red-500 text-xs mt-1">
          Data inválida. Use o formato DD/MM/AAAA
        </div>
      )}
    </div>
  );
}
